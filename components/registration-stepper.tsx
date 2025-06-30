"use client"
import { useState, type FormEvent } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { submitRegistrationStep } from "@/app/cadastro/actions"
import { Loader2, User, Phone, ShieldCheck, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import InputMask from "react-input-mask"

interface RegistrationStepperProps {
  cpf: string
}

type FormData = {
  nome?: string
  apelido?: string
  nascimento?: string
  telefone?: string
  email?: string
  posicao?: string
  numero?: string
  role?: "jogador" | "admin"
}

const steps = [
  { id: 1, title: "Informações Pessoais", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Contato e Posição", icon: <Phone className="h-5 w-5" /> },
  { id: 3, title: "Finalização", icon: <ShieldCheck className="h-5 w-5" /> },
]

export default function RegistrationStepper({ cpf }: RegistrationStepperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined })) // Clear error on change
  }
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const result = await submitRegistrationStep(currentStep, cpf, formData)

    if (result.success) {
      toast({ title: `Passo ${currentStep} Concluído!`, description: "Informações salvas." })
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1)
        setFormData({}) // Clear form for next step, or selectively clear
      } else {
        toast({
          title: "Cadastro Finalizado!",
          description: "Bem-vindo à AFPS! Você será redirecionado.",
          variant: "default",
        })
        // Redirect to dashboard or login
        router.push("/dashboard")
      }
    } else {
      if (result.errors) {
        setErrors(result.errors)
        toast({
          title: "Erro de Validação",
          description: "Por favor, corrija os campos destacados.",
          variant: "destructive",
        })
      } else {
        toast({ title: "Erro", description: result.message || "Ocorreu um erro.", variant: "destructive" })
      }
    }
    setIsLoading(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Information
        return (
          <>
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" name="nome" value={formData.nome || ""} onChange={handleChange} required />
              {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome[0]}</p>}
            </div>
            <div>
              <Label htmlFor="apelido">Apelido (Opcional)</Label>
              <Input id="apelido" name="apelido" value={formData.apelido || ""} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nascimento">Data de Nascimento</Label>
              <Input
                id="nascimento"
                name="nascimento"
                type="date"
                value={formData.nascimento || ""}
                onChange={handleChange}
                required
              />
              {errors.nascimento && <p className="text-sm text-destructive mt-1">{errors.nascimento[0]}</p>}
            </div>
          </>
        )
      case 2: // Contact and Position
        return (
          <>
            <div>
              <Label htmlFor="telefone">Telefone (Opcional)</Label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone || ""}
                onChange={handleChange}
                maskChar="_"
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                  />
                )}
              </InputMask>
              {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone[0]}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={formData.email || ""}
                onChange={handleChange}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <Label htmlFor="posicao">Posição em Campo (Opcional)</Label>
              <Input
                id="posicao"
                name="posicao"
                placeholder="Ex: Atacante, Goleiro"
                value={formData.posicao || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="numero">Número da Camisa (Opcional)</Label>
              <Input
                id="numero"
                name="numero"
                type="number"
                placeholder="Ex: 10"
                value={formData.numero || ""}
                onChange={handleChange}
              />
              {errors.numero && <p className="text-sm text-destructive mt-1">{errors.numero[0]}</p>}
            </div>
          </>
        )
      case 3: // Finalization
        return (
          <div>
            <Label htmlFor="role">Perfil Desejado</Label>
            <Select
              name="role"
              onValueChange={(value) => handleSelectChange("role", value)}
              value={formData.role || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jogador">Jogador</SelectItem>
                {/* Admin role might be restricted based on pre-authorization */}
                <SelectItem value="admin">Administrador (Requer Aprovação)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive mt-1">{errors.role[0]}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              O perfil de Administrador está sujeito à aprovação da comissão.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Formulário de Cadastro AFPS</CardTitle>
        <CardDescription>
          CPF: {cpf} - Passo {currentStep} de {steps.length}: {steps[currentStep - 1].title}
        </CardDescription>
        {/* Stepper Visual Indicator */}
        <div className="flex justify-between items-center mt-4 mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep > step.id ? "bg-green-500 border-green-500 text-white" : currentStep === step.id ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground text-muted-foreground"}`}
              >
                {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
              <p
                className={`text-xs mt-1 ${currentStep >= step.id ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                {step.title}
              </p>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 transform -translate-x-1/2 w-full h-0.5 ${currentStep > step.id ? "bg-green-500" : "bg-muted"}`}
                  style={{ marginLeft: "50%", width: "calc(100% - 40px)", zIndex: -1 }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isLoading}
          >
            Anterior
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentStep === steps.length ? "Finalizar Cadastro" : "Próximo Passo"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
