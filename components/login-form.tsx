"use client"
import { useFormStatus } from "react-dom"
import { loginAction, type LoginFormState } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useActionState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

const initialState: LoginFormState = {
  message: null,
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
      disabled={pending}
      aria-label="Entrar no sistema"
    >
      {pending ? (
        <>
          <LogIn className="mr-2 h-5 w-5 animate-pulse" /> Entrando...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" /> Entrar
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        title: "Erro no Login",
        description: state.message,
        variant: "destructive",
      })
    }
    // Redirect is handled server-side, so no client-side redirect needed here
  }, [state, toast])

  return (
    <Card className="w-full h-full flex flex-col justify-center bg-secondary text-secondary-foreground shadow-xl">
      <CardHeader className="text-center">
        <Image src="/logo-afps.png" alt="AFPS Logo" width={80} height={80} className="mx-auto mb-3" />
        <CardTitle className="text-2xl font-bold text-primary">Acesso ao Sistema</CardTitle>
        <CardDescription className="text-secondary-foreground/80">Use seu CPF para entrar.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 px-6">
          <div className="space-y-1">
            <Label htmlFor="cpf" className="text-md font-semibold">
              CPF
            </Label>
            <Input
              id="cpf"
              name="cpf"
              type="text"
              placeholder="000.000.000-00"
              required
              className="text-lg p-3 bg-background text-foreground border-primary focus:ring-primary"
              pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
              title="Digite um CPF válido no formato XXX.XXX.XXX-XX ou XXXXXXXXXXX"
              aria-describedby="cpf-error"
            />
            {state?.message && !state.success && (
              <p id="cpf-error" className="text-sm text-red-400 pt-1">
                {state.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-6">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
