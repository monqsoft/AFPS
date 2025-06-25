"use client"

import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef } from "react"
import { updateMensalidadeAction } from "@/app/admin/actions" // Assuming action exists
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

interface ConfigMensalidadeFormProps {
  currentValor: number
}

interface UpdateMensalidadeState {
  message?: string
  success: boolean
  errors?: {
    valor?: string[]
    general?: string
  }
}

const initialState: UpdateMensalidadeState = {
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Atualizar Valor
    </Button>
  )
}

export default function ConfigMensalidadeForm({ currentValor }: ConfigMensalidadeFormProps) {
  const [state, formAction] = useFormState(updateMensalidadeAction, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Sucesso!" : "Erro",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
    if (state?.errors?.general) {
      toast({
        title: "Erro",
        description: state.errors.general,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Valor da Mensalidade</CardTitle>
        <CardDescription>
          Defina o valor padrão para a mensalidade dos jogadores. O valor atual é R$ {currentValor.toFixed(2)}.
        </CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="valorMensalidade">Novo Valor (R$)</Label>
            <Input
              id="valorMensalidade"
              name="valorMensalidade"
              type="number"
              step="0.01"
              placeholder={currentValor.toFixed(2)}
              required
              defaultValue={currentValor} // Or remove if you want it blank
            />
            {state?.errors?.valor && <p className="text-sm text-destructive mt-1">{state.errors.valor[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
