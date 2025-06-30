"use client"
import { useFormState, useFormStatus } from "react-dom"
import { checkCpfAuthorization, type CpfCheckState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import RegistrationStepper from "@/components/registration-stepper"
import InputMask from "react-input-mask"

const initialState: CpfCheckState = {
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
      disabled={pending}
    >
      {pending ? "Verificando..." : "Verificar CPF e Continuar"}
    </Button>
  )
}

export default function CadastroPage() {
  const [state, formAction] = useFormState(checkCpfAuthorization, initialState)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Aviso" : "Erro na Verificação",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
    if (state?.isAuthorized && state.isRegistered) {
      console.log("Usuário já registrado e autorizado, redirecionando para o login.", state && state);

      setTimeout(() => router.push("/login"), 2000) // Redirect to login after showing message
    }
  }, [state, toast, router])

  if (state?.success && state.isAuthorized && !state.isRegistered && state.cpf) {
    return (
      <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-secondary">
        <Image src="/logo-afps.png" alt="AFPS Logo" width={100} height={100} className="mb-6" />
        <RegistrationStepper cpf={state.cpf} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Image src="/logo-afps.png" alt="AFPS Logo" width={100} height={100} className="mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-secondary dark:text-primary">Cadastro AFPS</CardTitle>
          <CardDescription className="text-muted-foreground">
            Informe seu CPF para iniciar o cadastro. Seu CPF deve estar previamente autorizado pela administração.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-lg">
                CPF
              </Label>
              <InputMask
                mask="999.999.999-99"
                value={state.cpf || ""}
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, ''); // Remove non-digits for internal state
                  // No need to update state here, as formAction will handle it
                }}
                maskChar="_"
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="cpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    required
                    className="text-lg p-3"
                    title="Digite um CPF válido no formato XXX.XXX.XXX-XX ou XXXXXXXXXXX"
                  />
                )}
              </InputMask>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            {state?.message && (
              <p
                className={`text-sm text-center ${state.success && state.isAuthorized && state.isRegistered ? "text-blue-600" : state.success ? "text-green-600" : "text-destructive"}`}
              >
                {state.message}
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}