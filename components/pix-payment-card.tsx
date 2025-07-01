"use client"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Share2, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generatePixPayment } from "@/app/jogadores/actions"
import { PixData } from "@/types/pix-interfaces"

interface PixPaymentCardProps {
  jogadorCpf: string
}

export default function PixPaymentCard({ jogadorCpf }: PixPaymentCardProps) {
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGeneratePix = async () => {
    setIsLoading(true)
    setError(null)
    setPixData(null)
    const result = await generatePixPayment(jogadorCpf)
    if (result.pixData) {
      setPixData(result.pixData)
      toast({ title: "PIX Gerado!", description: "Código PIX e QR Code prontos para pagamento." })
    } else if (result.error) {
      setError(result.error)
      toast({ title: "Erro ao Gerar PIX", description: result.error, variant: "destructive" })
    }
    setIsLoading(false)
  }

  const handleCopyToClipboard = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload)
      toast({ description: "Código PIX copiado para a área de transferência!" })
    }
  }

  const handleShareWhatsApp = () => {
    if (pixData) {
      const text = `PIX para pagar minha mensalidade na AFPS (${pixData.descricao}):\n\nCopia e Cola:\n${pixData.payload}\n\nValor: R$ ${pixData.valor.toFixed(2)}`
      // Note: Sharing QR code image URL directly in WhatsApp text is not standard.
      // Users typically share the text and can send the image separately if they save it.
      // Or, you could host the QR code image and share its URL.
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Pagamento de Mensalidade via PIX</CardTitle>
        <CardDescription>Gere seu código PIX para pagar a mensalidade do mês.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!pixData && !isLoading && (
          <Button
            onClick={handleGeneratePix}
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Gerar PIX para Mensalidade Atual
          </Button>
        )}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">⚽️ Gerando seu PIX...</p>
          </div>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}

        {pixData && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pix-codigo" className="text-base font-semibold">
                Código PIX (Copia e Cola)
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input id="pix-codigo" value={pixData.payload} readOnly className="text-sm bg-muted/50" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  aria-label="Copiar código PIX"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Descrição: {pixData.descricao}</p>
              <p className="text-sm font-semibold mt-1">Valor: R$ {pixData.valor.toFixed(2)}</p>
            </div>

            <div>
              <Label className="text-base font-semibold">QR Code PIX</Label>
              <div className="mt-2 p-4 border rounded-md bg-white flex justify-center">
                <Image src={pixData.qrCodeBase64 || "/placeholder.svg"} alt="QR Code PIX" width={200} height={200} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-base py-3"
              >
                <Share2 className="mr-2 h-5 w-5" /> Compartilhar via WhatsApp
              </Button>
              <Button onClick={handleGeneratePix} className="w-full text-base py-3" variant="outline">
                <RefreshCw className="mr-2 h-5 w-5" /> Gerar Novo PIX
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
