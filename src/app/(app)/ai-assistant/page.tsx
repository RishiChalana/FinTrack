import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiChat } from "@/components/ai/chat";

export default function AiAssistantPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Financial Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <AiChat />
      </CardContent>
    </Card>
  );
}
