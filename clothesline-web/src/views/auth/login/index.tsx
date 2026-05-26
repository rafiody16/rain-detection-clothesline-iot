"use client"

import { LoginForm } from "@/components/auth/login-form"
import { GalleryVerticalEndIcon } from "lucide-react"
// 1. Impor komponen ilustrasi kita
import ClotheslineIllustration from "@/components/ui/clothes"

export default function ViewLogin() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEndIcon className="size-4" />
                        </div>
                        Smart Clothesline
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>

            <div className="relative hidden min-h-svh bg-muted lg:flex items-center justify-center p-10">
                <ClotheslineIllustration 
                    className="w-full h-auto max-w-md object-contain" 
                />
            </div>
        </div>
    )
}