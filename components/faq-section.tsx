import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "How accurate is the AI analysis?",
      answer:
        "Our analysis is based on real-time queries to 7 leading AI models including ChatGPT, Claude, Gemini, and more. We run over 100 prompts per brand weekly to ensure statistically significant results. Our methodology has been validated against actual consumer behavior data.",
    },
    {
      question: "Which AI models do you query?",
      answer:
        "We analyze responses from ChatGPT (GPT-4), Claude (Anthropic), Gemini (Google), Llama, Mistral, Cohere, and Perplexity. This gives you comprehensive coverage of the AI landscape that influences consumer decisions.",
    },
    {
      question: "How long until I see my first report?",
      answer:
        "Your first report is typically ready within 24-48 hours after setup. We need time to run comprehensive queries across all AI models and compile actionable insights. After that, reports are delivered according to your plan's schedule.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, absolutely. There are no long-term contracts. You can cancel your subscription at any time from your dashboard. If you cancel, you'll retain access until the end of your billing period.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Security is our top priority. We use enterprise-grade encryption for all data, never share your competitive intelligence with other customers, and are SOC 2 compliant. Your brand strategy stays completely confidential.",
    },
  ]

  return (
    <section className="py-20 bg-card/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">Frequently Asked Questions</h2>
        <p className="text-center text-muted-foreground mb-12">Everything you need to know about AI Vibes Radar</p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
