import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Clock, Award, Edit, Facebook, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  // If session exists, redirect to dashboard, or show home if preferred.
  // For now, let's assume if logged in, they go to dashboard.
  // If you want a home page for logged-in users, remove this redirect.
  //redirect("/dashboard")

  // The content below would be shown if not redirecting
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-secondary text-secondary-foreground rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold">Bem-vindo à Associação de Futebol de Porto dos Santos!</h1>
        <p className="mt-4 text-xl max-w-2xl mx-auto">
          Aqui você encontrará informações sobre nossa associação de futebol, eventos, jogadores e muito mais.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary">Nossa Associação em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Localização */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-secondary">Nossa Sede</CardTitle>
              <MapPin className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Porto dos Santos, BA</div>
              <p className="text-xs text-muted-foreground">Venha nos visitar! Campo principal e sede administrativa.</p>
              {/* Placeholder for map */}
              <div className="mt-4 h-40 bg-gray-200 rounded flex items-center justify-center text-muted-foreground">
                (Mapa interativo aqui)
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Quantidade de jogadores */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-secondary">Nossos Atletas</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+150 Jogadores</div>
              <p className="text-xs text-muted-foreground">Ativos em diversas categorias.</p>
            </CardContent>
          </Card>

          {/* Card 3: Jogos aos domingos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-secondary">Dia de Jogo</CardTitle>
              <Clock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Domingos de Manhã</div>
              <p className="text-xs text-muted-foreground">Traga sua torcida e apoie nossos times!</p>
            </CardContent>
          </Card>

          {/* Card 4: Comissão atuante */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-secondary">Comissão Técnica</CardTitle>
              <Award className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestão 2024-2026</div>
              <p className="text-xs text-muted-foreground">
                Dedicados ao crescimento do futebol local. (Nomes/Fotos aqui)
              </p>
            </CardContent>
          </Card>

          {/* Card 5: Chamada para inscrição */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Junte-se a Nós!</CardTitle>
              <Edit className="h-6 w-6 text-primary-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <p className="mb-4">Faça parte da nossa história. Inscreva-se e venha jogar conosco!</p>
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full text-base py-6"
              >
                Quero me Inscrever
              </Button>
            </CardContent>
          </Card>

          {/* Card 6: Redes sociais */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-secondary">Siga-nos</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-10 w-10 text-primary hover:text-primary/80" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-10 w-10 text-primary hover:text-primary/80" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-10 w-10 text-primary hover:text-primary/80" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
