import { ChatInterface } from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <ChatInterface />
    </main>
  );
}
