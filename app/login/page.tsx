import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Facebook,
  Twitter,
  Instagram,
  Users2,
  CalendarClock,
  MapPinned,
  Handshake,
  Newspaper,
  MessageSquare,
} from "lucide-react"
import LoginForm from "@/components/login-form" // Import the new client component

// Placeholder for dynamic data, e.g., player count
const playerCount = "150+" // Replace 'X' with a more specific number if available or fetch dynamically

export default function LoginPage() {
  const bentoGridItems = [
    {
      title: "Localização",
      description:
        "Nossa sede está localizada no campo situado na Rua Alto do Verão, em Porto dos Santos, Itaparica, Bahia.",
      icon: <MapPinned className="h-8 w-8 text-primary" />,
      className: "md:col-span-2 bg-background text-foreground",
      content: (
        <div className="mt-2 h-40 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">🗺️ Mapa Interativo Aqui</p>
        </div>
      ),
    },
    {
      title: "Número de Jogadores",
      description: `Contamos com uma vibrante comunidade de aproximadamente ${playerCount} jogadores. Junte-se a nós!`,
      icon: <Users2 className="h-8 w-8 text-primary" />,
      className: "bg-background text-foreground",
    },
    {
      title: "Jogos aos Domingos",
      description:
        "Nossos jogos são realizados aos domingos pela manhã. Venha celebrar a amizade e desfrutar de partidas emocionantes.",
      icon: <CalendarClock className="h-8 w-8 text-primary" />,
      className: "bg-background text-foreground",
    },
    {
      title: "Comissão Atuante",
      description: "Administrada por Mauricio Porto, Stivie e Bugari. Empenhados em criar um ambiente inclusivo.",
      icon: <Handshake className="h-8 w-8 text-primary" />,
      className: "md:col-span-1 bg-background text-foreground",
    },
    {
      title: "Pronto para o Time?",
      description:
        "Se você adora futebol, preencha nosso formulário de inscrição e faça parte dessa emocionante jornada esportiva.",
      icon: <Newspaper className="h-8 w-8 text-primary" />,
      className: "md:col-span-2 bg-primary text-primary-foreground",
      content: (
        <Link href="/cadastro" legacyBehavior passHref>
          <Button 
            size="lg"
            className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg py-3"
          >
            Inscreva-se Agora
          </Button>
        </Link>
      ),
    },
    {
      title: "Entre em Contato",
      description: "Tem alguma pergunta ou sugestão? Estamos aqui para ajudar. Entre em contato conosco.",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      className: "bg-background text-foreground",
    },
    {
      title: "Siga-nos",
      icon: <Users className="h-8 w-8 text-primary" />,
      className: "bg-background text-foreground",
      content: (
        <div className="flex justify-around items-center mt-4">
          <Link href="#" aria-label="Facebook AFPS" target="_blank" rel="noopener noreferrer">
            <Facebook className="h-8 w-8 text-primary hover:text-primary/80 transition-colors" />
          </Link>
          <Link href="#" aria-label="Twitter AFPS" target="_blank" rel="noopener noreferrer">
            <Twitter className="h-8 w-8 text-primary hover:text-primary/80 transition-colors" />
          </Link>
          <Link href="#" aria-label="Instagram AFPS" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-8 w-8 text-primary hover:text-primary/80 transition-colors" />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/90 to-neutral-800 p-4 md:p-8 flex flex-col items-center text-foreground">
      <header className="text-center my-8 md:my-12">
        <Image
          src="/logo-afps.png"
          alt="AFPS Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 shadow-lg rounded-full bg-background p-2"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
          Bem-vindo à Associação de Futebol de Porto dos Santos!
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-background/90">
          Aqui você encontrará informações sobre nossa associação de futebol. Explore abaixo e acesse o sistema.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,_auto)]">
        {/* Login Form Card - Spans 1 column, potentially more height */}
        <div className="lg:col-span-1 md:row-span-2 h-full min-h-[380px] md:min-h-[calc(2*180px+1.5rem)]">
          <LoginForm />
        </div>

        {/* Bento Grid Info Cards */}
        {bentoGridItems.map((item, index) => (
          <Card
            key={index}
            className={`rounded-xl shadow-2xl p-6 flex flex-col transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-primary/30 ${item.className}`}
          >
            <CardHeader className="p-0 mb-3">
              <div className="flex items-center gap-3">
                {item.icon}
                <CardTitle
                  className={`text-xl font-semibold ${item.className?.includes("text-primary-foreground") ? "text-primary-foreground" : "text-secondary"}`}
                >
                  {item.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              {item.description && (
                <p
                  className={`text-sm ${item.className?.includes("text-primary-foreground") ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                >
                  {item.description}
                </p>
              )}
              {item.content}
            </CardContent>
          </Card>
        ))}
      </main>

      <footer className="text-center mt-12 py-6 text-background/70 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Associação de Futebol de Porto dos Santos. Todos os direitos reservados.
        </p>
        <p>Desenvolvido com ⚽ e paixão.</p>
      </footer>
    </div>
  )
}
