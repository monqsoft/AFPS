import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import Player, { type IPlayer } from "@/models/player-model"
import PixPaymentCard from "@/components/pix-payment-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, ShieldCheck, Hash, Mail, Phone, CalendarDays, Shirt } from "lucide-react"
import { ROLES } from "@/lib/roles"

export default async function JogadorProfilePage({ params }: { params: { cpf: string } }) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Security check: Player can only see their own profile unless admin
  // Or if an admin is viewing any profile.
  if (session.role !== "admin" && session.cpf !== params.cpf) {
    // Redirect to their own profile or an error page
    redirect(`/jogadores/${session.cpf}?error=unauthorized`)
  }

  await dbConnect()
  const viewedPlayer = (await Player.findOne({ cpf: params.cpf }).lean()) as IPlayer | null

  if (!viewedPlayer) {
    return <div className="text-center py-10">Jogador não encontrado.</div>
  }

  const isOwnProfile = session.cpf === viewedPlayer.cpf

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <UserCircle className="h-16 w-16 text-primary" />
            <div>
              <CardTitle className="text-3xl md:text-4xl">
                {viewedPlayer.nome} {viewedPlayer.apelido && `(${viewedPlayer.apelido})`}
              </CardTitle>
              <CardDescription className="text-lg">
                {viewedPlayer.role} - Status:{" "}
                <span
                  className={`font-semibold ${viewedPlayer.status === "ativo" ? "text-green-600" : "text-red-600"}`}
                >
                  {viewedPlayer.status}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 text-lg">
          <div className="space-y-3">
            <p className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> <strong>CPF:</strong> {viewedPlayer.cpf}
            </p>
            {viewedPlayer.nascimento && (
              <p className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" /> <strong>Nascimento:</strong>{" "}
                {new Date(viewedPlayer.nascimento).toLocaleDateString("pt-BR")}
              </p>
            )}
            {viewedPlayer.posicao && (
              <p className="flex items-center">
                <Shirt className="mr-2 h-5 w-5 text-primary" /> <strong>Posição:</strong> {viewedPlayer.posicao}
              </p>
            )}
            {viewedPlayer.numero && (
              <p className="flex items-center">
                <Hash className="mr-2 h-5 w-5 text-primary" /> <strong>Número:</strong> {viewedPlayer.numero}
              </p>
            )}
          </div>
          <div className="space-y-3">
            {viewedPlayer.email && (
              <p className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-primary" /> <strong>Email:</strong> {viewedPlayer.email}
              </p>
            )}
            {viewedPlayer.telefone && (
              <p className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-primary" /> <strong>Telefone:</strong> {viewedPlayer.telefone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PIX Payment Card - only for player viewing their own profile */}
      {isOwnProfile && viewedPlayer.role === ROLES.JOGADOR && <PixPaymentCard jogadorCpf={viewedPlayer.cpf} />}

      {/* Placeholder for other player-specific info (stats, payments, etc.) */}
      {isOwnProfile && viewedPlayer.role === ROLES.JOGADOR && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Minhas Estatísticas e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Estatísticas</h3>
                <p>Gols: 0</p>
                <p>Assistências: 0</p>
                <p>Cartões Amarelos: 0</p>
                <p>Cartões Vermelhos: 0</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Histórico de Pagamentos</h3>
                <p>Último Pagamento: N/A</p>
                <p>Status da Mensalidade: Em dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin actions placeholder */}
      {session.role === "admin" && !isOwnProfile && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações de Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p>✏️ Em breve: editar dados, adicionar gols/cartões, ativar/inativar...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
