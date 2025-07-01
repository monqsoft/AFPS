import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 text-center">
      <Card className="w-full max-w-md p-8 space-y-6">
        <CardHeader>
          <Image
            src="/placeholder-logo.png" // Using a placeholder, ideally a football-themed image
            alt="404 Football Theme"
            width={150}
            height={150}
            className="mx-auto mb-4"
          />
          <CardTitle className="text-5xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Página Não Encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Parece que você chutou a bola para fora do campo! A página que você está procurando não existe.
          </p>
          <p className="text-sm text-muted-foreground">
            Não se preocupe, até os melhores jogadores erram o passe às vezes.
          </p>
          <Link href="/dashboard" passHref>
            <Button className="w-full">Voltar para o Campo (Dashboard)</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
