import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import eunoiaLogo from "@/assets/eunoia-logo-dark.webp";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={eunoiaLogo} alt="Eunoia" className="h-8" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">MCP Data Researcher</h1>
              <p className="text-xs text-muted-foreground">My Cute Pony - Powered by Model Context Protocol</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/">Home</NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Everything you need to know about MCP Data Researcher
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                What is MCP Data Researcher?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                MCP Data Researcher is an AI-powered data analysis tool that uses the Model Context Protocol to query multiple data sources including MySQL EPOS Database, Power BI models, and Cosmos NoSQL databases. It helps you discover insights across your data infrastructure seamlessly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                What data sources does it support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Currently, MCP Data Researcher supports MySQL EPOS databases, Power BI data models, and Cosmos NoSQL databases. You can query all sources simultaneously or select a specific source for targeted analysis.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                How do I ask questions?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Simply type your question in natural language in the chat interface. You can ask about sales, inventory, customers, suppliers, or any other data point. The AI will understand your question and retrieve relevant insights from your connected data sources.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                Can I upload files for analysis?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! You can attach files to your queries using the file upload button. The AI will process your files and incorporate them into the analysis alongside your connected data sources.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                What are Golden Questions?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Golden Questions are pre-configured queries that help you get started quickly. They cover common business questions about sales performance, inventory status, customer behavior, and supplier reliability. Click the dropdown to select any of these questions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-border rounded-xl px-6 bg-card/50">
              <AccordionTrigger className="text-left hover:no-underline">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, all data queries are processed securely through encrypted connections. Your data never leaves your infrastructure, and the AI only accesses information through authorized API connections configured by your system administrators.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
