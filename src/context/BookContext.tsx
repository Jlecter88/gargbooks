"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import initialBooks from "@/data/livros-mock.json";
import initialContos from "@/data/contos-mock.json";

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
  addBook: (book: Omit<Book, "id" | "rating" | "reviews">) => void;
  addReview: (bookId: string, username: string, rating: number, text: string) => void;
  addBookmark: (bookId: string, text: string) => void;
  removeBookmark: (bookId: string, text: string) => void;
  toggleReactionOnBook: (bookId: string, reactionType: string, userId: string) => void;
  toggleReactionOnReview: (bookId: string, reviewId: string, reactionType: string, userId: string) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount and merge with mock data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBooks = localStorage.getItem("gargbooks_list");
      const storedBookmarks = localStorage.getItem("gargbooks_bookmarks");

      // Tag each source with its type
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
          // Keep user-published books (isUserPublished === true)
          const userBooks = parsedStored.filter((b) => b.isUserPublished);

          // For each disk book, find if it has reviews in localStorage and merge them
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

      // Defer state updates to avoid synchronous cascading renders during mount / hydration
      setTimeout(() => {
        setBooks(finalBooks);
        if (storedBookmarks) {
          try {
            setBookmarks(JSON.parse(storedBookmarks));
          } catch (e) {
            console.error("Failed to parse bookmarks", e);
          }
        }
        setIsLoaded(true);
      }, 0);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("gargbooks_list", JSON.stringify(books));
    }
  }, [books, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("gargbooks_bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks, isLoaded]);

  const addBook = (newBookData: Omit<Book, "id" | "rating" | "reviews">) => {
    const newBook: Book = {
      ...newBookData,
      id: newBookData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      rating: 5,
      reviews: [],
      isUserPublished: true,
    };
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
