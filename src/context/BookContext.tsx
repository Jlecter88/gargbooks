"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import initialBooks from "@/data/livros-mock.json";
import initialContos from "@/data/contos-mock.json";
import { db } from "@/utils/firebase";
import { collection, query, limit, startAfter, getDocs, orderBy } from "firebase/firestore";

export interface Edition {
  id: string;
  publisher: string;
  year: number;
  isbn: string;
  pages: number;
  coverType: string;
  priceBR: number;
  pricePT: number;
  linkBR: string;
  linkPT: string;
}

export interface Review {
  id: string;
  username: string;
  rating: number;
  date: string;
  text: string;
  authorId?: string; // Optional ID if the review is written by a logged-in user
  reactions?: Record<string, string[]>; // mapping reaction type to user IDs
}

export interface BookTranslation {
  title: string;
  synopsis: string;
  fullText: string;
  downloadFile?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId?: string; // ID of the publishing user
  year: number;
  genres: string[];
  rating: number;
  coverGradient: string;
  coverImage?: string;
  synopsis: string;
  fullText: string;
  downloadFile?: string;
  translations?: Record<string, BookTranslation>;
  editions: Edition[];
  reviews: Review[];
  isUserPublished?: boolean;
  publishWithRealPhoto?: boolean; // toggle to show real photo or anonymous avatar for +18
  type: "livro" | "conto"; // distinguish books from short stories
  reactions?: Record<string, string[]>; // mapping reaction type to user IDs
  publicDomain?: boolean;
  language?: string;
  // Content rating and sensitivity flags
  ageRating?: "livre" | "+16" | "+18";
  sensitiveContent?: boolean;
  triggers?: string[]; // e.g. ["violencia", "morte", "sangue", "panico"]
}

export interface Bookmark {
  bookId: string;
  text: string;
  date: string;
}

interface BookContextType {
  books: Book[];
  livros: Book[];   // only type === "livro"
  contos: Book[];   // only type === "conto"
  bookmarks: Bookmark[];
  addBook: (book: Omit<Book, "id" | "rating" | "reviews"> & { id?: string }) => void;
  addReview: (bookId: string, username: string, rating: number, text: string) => void;
  addBookmark: (bookId: string, text: string) => void;
  removeBookmark: (bookId: string, text: string) => void;
  toggleReactionOnBook: (bookId: string, reactionType: string, userId: string) => void;
  toggleReactionOnReview: (bookId: string, reviewId: string, reactionType: string, userId: string) => void;
}

const FIREBASE_PAGE_SIZE = 50;
const FIREBASE_MAX_BOOKS = 200;

async function fetchBooksFromFirestore(): Promise<Book[]> {
  const allBooks: Book[] = [];
  let lastDoc: unknown = null;

  while (allBooks.length < FIREBASE_MAX_BOOKS) {
    const q = lastDoc
      ? query(collection(db, "books"), orderBy("title"), limit(FIREBASE_PAGE_SIZE), startAfter(lastDoc))
      : query(collection(db, "books"), orderBy("title"), limit(FIREBASE_PAGE_SIZE));

    const snapshot = await getDocs(q);
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      allBooks.push({ ...(doc.data() as Book), id: doc.id });
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.docs.length < FIREBASE_PAGE_SIZE) break;
  }

  return allBooks;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Firestore first, then fall back to localStorage + JSON mock data
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clean oversized data from previous version (fullText used to be stored)
      try {
        const test = localStorage.getItem("gargbooks_list");
        if (test && test.length > 100_000) {
          localStorage.removeItem("gargbooks_list");
        }
      } catch {
        localStorage.removeItem("gargbooks_list");
        localStorage.removeItem("gargbooks_bookmarks");
      }

      const loadData = async () => {
        let loadedBooks: Book[] | null = null;

        // 1. Try Firestore first
        try {
          const fbBooks = await fetchBooksFromFirestore();
          if (fbBooks.length > 0) {
            loadedBooks = fbBooks;
          }
        } catch (err) {
          console.warn("Firestore unavailable, falling back to local data:", err);
        }

        // 2. If Firestore failed/empty, fall back to localStorage + JSON
        if (!loadedBooks) {
          const storedBooks = localStorage.getItem("gargbooks_list");

          const typedLivros = (initialBooks as Omit<Book, "type">[]).map(b => ({
            ...b,
            type: "livro" as const,
          }));
          const typedContos = (initialContos as Omit<Book, "type">[]).map(b => ({
            ...b,
            type: "conto" as const,
          }));
          const diskBooks: Book[] = [...typedLivros, ...typedContos];
          let finalBooks = diskBooks;

          if (storedBooks) {
            try {
              const parsedStored = JSON.parse(storedBooks) as Book[];
              const userBooks = parsedStored.filter((b) => b.isUserPublished);

              const mergedDiskBooks = diskBooks.map((diskBook) => {
                const storedBook = parsedStored.find((sb) => sb.id === diskBook.id);
                if (storedBook && storedBook.reviews && storedBook.reviews.length > 0) {
                  const reviews = storedBook.reviews;
                  const avgRating =
                    reviews.length > 0
                      ? parseFloat(
                          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        )
                      : diskBook.rating;
                  return { ...diskBook, reviews, rating: avgRating };
                }
                return diskBook;
              });

              finalBooks = [...userBooks, ...mergedDiskBooks];
            } catch (e) {
              console.error("Failed to parse stored books", e);
            }
          }

          loadedBooks = finalBooks;
        }

        // 3. Defer state updates to avoid synchronous cascading renders
        setTimeout(() => {
          if (loadedBooks) setBooks(loadedBooks);
          const storedBookmarks = localStorage.getItem("gargbooks_bookmarks");
          if (storedBookmarks) {
            try {
              setBookmarks(JSON.parse(storedBookmarks));
            } catch (e) {
              console.error("Failed to parse bookmarks", e);
            }
          }
          setIsLoaded(true);
        }, 0);
      };

      loadData();
    }
  }, []);

  // Save to localStorage when state changes (strip fullText to avoid quota exceeded)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const trimmed = books.map((b) => {
        if (b.isUserPublished) return b;
        const { fullText, ...rest } = b;
        // Keep translation metadata (title, synopsis, downloadFile) but strip fullText inside them
        if (rest.translations) {
          for (const code of Object.keys(rest.translations)) {
            const { fullText: _ft, ...meta } = rest.translations[code]!;
            rest.translations[code] = meta as BookTranslation;
          }
        }
        return rest;
      });
      localStorage.setItem("gargbooks_list", JSON.stringify(trimmed));
    } catch {
      localStorage.removeItem("gargbooks_list");
    }
  }, [books, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("gargbooks_bookmarks", JSON.stringify(bookmarks));
    } catch {
      localStorage.removeItem("gargbooks_bookmarks");
    }
  }, [bookmarks, isLoaded]);

  const addBook = (newBookData: Omit<Book, "id" | "rating" | "reviews"> & { id?: string }) => {
    const newBook: Book = {
      ...newBookData,
      id: newBookData.id || newBookData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      rating: 5,
      reviews: [],
      isUserPublished: true,
    } as Book;
    setBooks((prev) => [newBook, ...prev]);
  };

  const addReview = (bookId: string, username: string, rating: number, text: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const newReview: Review = {
            id: `rev-${Date.now()}`,
            username: username || "Leitor Anônimo",
            rating,
            date: new Date().toISOString().split("T")[0],
            text,
          };
          const updatedReviews = [newReview, ...book.reviews];
          const avgRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...book,
            reviews: updatedReviews,
            rating: parseFloat(avgRating.toFixed(1)),
          };
        }
        return book;
      })
    );
  };

  const addBookmark = (bookId: string, text: string) => {
    // Avoid duplicate bookmarks for the exact same text in the same book
    setBookmarks((prev) => {
      if (prev.some((b) => b.bookId === bookId && b.text === text)) {
        return prev;
      }
      return [
        {
          bookId,
          text,
          date: new Date().toLocaleDateString("pt-BR"),
        },
        ...prev,
      ];
    });
  };

  const removeBookmark = (bookId: string, text: string) => {
    setBookmarks((prev) => prev.filter((b) => !(b.bookId === bookId && b.text === text)));
  };

  const toggleReactionOnBook = (bookId: string, reactionType: string, userId: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const reactions = book.reactions ?? {};
          const userList = reactions[reactionType] ?? [];
          const hasReacted = userList.includes(userId);
          const updatedUserList = hasReacted
            ? userList.filter((id) => id !== userId)
            : [...userList, userId];
          return {
            ...book,
            reactions: {
              ...reactions,
              [reactionType]: updatedUserList,
            },
          };
        }
        return book;
      })
    );
  };

  const toggleReactionOnReview = (bookId: string, reviewId: string, reactionType: string, userId: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const updatedReviews = book.reviews.map((review) => {
            if (review.id === reviewId) {
              const reactions = review.reactions ?? {};
              const userList = reactions[reactionType] ?? [];
              const hasReacted = userList.includes(userId);
              const updatedUserList = hasReacted
                ? userList.filter((id) => id !== userId)
                : [...userList, userId];
              return {
                ...review,
                reactions: {
                  ...reactions,
                  [reactionType]: updatedUserList,
                },
              };
            }
            return review;
          });
          return {
            ...book,
            reviews: updatedReviews,
          };
        }
        return book;
      })
    );
  };

  const livros = books.filter(b => b.type === "livro");
  const contos = books.filter(b => b.type === "conto");

  return (
    <BookContext.Provider
      value={{
        books,
        livros,
        contos,
        bookmarks,
        addBook,
        addReview,
        addBookmark,
        removeBookmark,
        toggleReactionOnBook,
        toggleReactionOnReview,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}
