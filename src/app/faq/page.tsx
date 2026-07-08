import type { Metadata } from "next";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "Legislação & FAQ | Gargbooks - Proteção Etária e Leitura Premium",
  description: "Dúvidas frequentes, conformidade de conteúdo com a Lei FELCA (ECA Digital no Brasil), proteção de menores e regras legislativas do Brasil, Portugal, UE e EUA para RPG e contos +18.",
  openGraph: {
    title: "Legislação & FAQ | Gargbooks",
    description: "Informações sobre conformidade etária e verificação de idade sob a Lei FELCA (Lei 15.211/2025).",
    type: "website",
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é o Gargbooks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O Gargbooks é um sebo literário digital premium e clube de leitura com curadoria de edições físicas de livros clássicos e publicação de contos digitais originais da comunidade."
      }
    },
    {
      "@type": "Question",
      "name": "Como funcionam os links de afiliados?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Indicamos edições físicas selecionadas. Ao comprar por meio de nossos links de afiliados, recebemos uma pequena comissão que ajuda a sustentar a plataforma."
      }
    },
    {
      "@type": "Question",
      "name": "O Gargbooks é seguro para menores?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Desenhado sob os conceitos de Safety by Design, o site protege qualquer conto restrito (+18) ou salas de RPG maduro com verificação de idade."
      }
    },
    {
      "@type": "Question",
      "name": "A verificação de idade é obrigatória?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A verificação por identidade ou selfie facial é obrigatória apenas para leitores que queiram acessar contos adultos restritos (+18) ou jogar em mesas de RPG com classificação indicativa restrita."
      }
    },
    {
      "@type": "Question",
      "name": "Como a Lei FELCA (Lei 15.211/2025) afeta plataformas digitais?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Lei FELCA (ECA Digital no Brasil) proíbe a simples autodeclaração de idade em caixas de diálogo, exigindo mecanismos confiáveis e robustos (biometria ou e-KYC) para portais com tráfego provável de menores."
      }
    }
  ]
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqContent />
    </>
  );
}
