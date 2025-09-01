"use client"

import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useRef } from "react"
import { addAuthorizedCpfAction } from "@/app/admin/actions"
import { AddAuthorizedCpfState } from "@/types/admin-interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle } from "lucide-react"
import { ROLES } from "@/lib/roles"

const initialState: AddAuthorizedCpfState = {
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
      Autorizar CPF
    </Button>
  )
}

export default function AddAuthorizedCpfForm() {
  const [state, formAction] = useActionState(addAuthorizedCpfAction, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Sucesso!" : "Erro",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
      if (state.success) {
        formRef.current?.reset() // Reset form on success
      }
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Autorizar Novo CPF para Cadastro</CardTitle>
        <CardDescription>Adicione um CPF para permitir que o usuário se cadastre no sistema.</CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cpf-auth">CPF (apenas números)</Label>
            <Input
              id="cpf-auth"
              name="cpf"
              type="text"
              placeholder="11122233344"
              required
              maxLength={11}
              pattern="\d{11}"
              title="Digite 11 números para o CPF."
            />
            {state?.errors?.cpf && <p className="text-sm text-destructive mt-1">{state.errors.cpf[0]}</p>}
          </div>
          <div>
            <Label htmlFor="nomeInicial">Nome Inicial (Opcional)</Label>
            <Input id="nomeInicial" name="nomeInicial" type="text" placeholder="Ex: João Silva (para identificação)" />
            {state?.errors?.nomeInicial && (
              <p className="text-sm text-destructive mt-1">{state.errors.nomeInicial[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="roleInicial">Perfil Inicial (Opcional)</Label>
            <Select name="roleInicial">
              <SelectTrigger>
                <SelectValue placeholder="Padrão: Jogador (após cadastro)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão (Jogador após cadastro)</SelectItem>
                <SelectItem value={ROLES.JOGADOR}>Jogador</SelectItem> 
                <SelectItem value={ROLES.ADMIN}>Administrador</SelectItem>
                <SelectItem value={ROLES.ARBITRO}>Árbitro</SelectItem>
                <SelectItem value={ROLES.COMISSAO}>Comissão</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.roleInicial && (
              <p className="text-sm text-destructive mt-1">{state.errors.roleInicial[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
