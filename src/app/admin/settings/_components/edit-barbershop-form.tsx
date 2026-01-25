"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, ImageIcon, Loader2, Save, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { updateBarbershop } from "@/app/_actions/update-barbershop"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUpload } from "@/lib/hooks/use-upload"
import { Barbershop } from "@prisma/client"

const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  address: z.string().min(1, "O endereço é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
})

interface EditBarbershopFormProps {
  barbershop: Barbershop
}

export function EditBarbershopForm({ barbershop }: EditBarbershopFormProps) {
  const router = useRouter()
  const { uploadFile } = useUpload()

  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: barbershop?.name,
      address: barbershop?.address ?? "",
      phone: barbershop?.phone ?? "",
      logoUrl: barbershop?.logoUrl || "",
      bannerUrl: barbershop?.bannerUrl || "",
    },
  })

  const handleImageUpload = async (field: "logoUrl" | "bannerUrl", setLoading: (v: boolean) => void) => {
    try {
      setLoading(true)
      const url = await uploadFile()
      if (url) {
        form.setValue(field, url)
        toast.success("Imagem carregada com sucesso!")
      }
    } catch {
      toast.error("Erro ao fazer upload da imagem, tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsSubmitting(true)
    try {
      await updateBarbershop({ ...data, id: barbershop.id })
      toast.success("Barbearia atualizada com sucesso!")
      router.refresh()
    } catch {
      toast.error("Erro ao salvar alterações. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-4xl mx-auto">

        {/* SECÇÃO VISUAL (Capa + Logo) */}
        <Card className="border-border bg-card overflow-hidden">
          {/* TODO: hidden adicionado para desativar temporariamente o banner */}
          <div className="relative hidden h-48 md:h-64 w-full bg-secondary/30 group">
            {/* Banner Image */}
            {form.watch("bannerUrl") ? (
              <Image
                src={form.watch("bannerUrl") as string}
                alt="Banner da Barbearia"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-20" />
              </div>
            )}

            {/* Overlay Banner Upload Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleImageUpload("bannerUrl", setIsUploadingBanner)}
                disabled={isUploadingBanner}
              >
                {isUploadingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                Alterar Capa
              </Button>
            </div>
          </div>

          <div className="px-6 relative pb-6">
            {/* Logo Image (Posicionado para sobrepor a capa) */}
            {/* TODO: adicionar -m-16 a div de baixo quando ativar o banner novamente */}
            <div className="relative mb-6 inline-block">
              <div className="relative h-32 w-32 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-xl">
                {form.watch("logoUrl") ? (
                  <Image
                    src={form.watch("logoUrl") as string}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <span className="text-xs font-bold">Sem Logo</span>
                  </div>
                )}

                {/* Botão de Upload do Logo (Pequeno, circular) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleImageUpload("logoUrl", setIsUploadingLogo)}>
                  {isUploadingLogo ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Título da Secção */}
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Identidade Visual</CardTitle>
                <CardDescription>
                  Essa logo será exibida na sua página de agendamento pública.
                </CardDescription>
              </div>
            </div>
          </div>
        </Card>

        {/* SECÇÃO INFORMAÇÕES */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Atualize as informações de contato e localização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Barbearia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Aparus Barber Club" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Bairro, Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* BOTÃO SALVAR (Fixo no fundo ou no final do form) */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}