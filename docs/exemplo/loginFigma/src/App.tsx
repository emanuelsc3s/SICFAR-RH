import React, { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import hero from '../.figma/image/miouix2y-249d828.png'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log({ email, password })
    alert('Login enviado')
  }

  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[1fr_1fr]">
      <div className="relative hidden md:block">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #58b1f0 0%, #04142c 100%)'
        }} />
        <img src={hero} alt="Candid" className="absolute left-16 top-0 h-full object-cover" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            <span className="text-2xl font-bold text-gray-900">NossoRH</span>
          </div>

          <h1 className="text-gray-900 text-lg font-medium mb-8">Login com seu e-mail</h1>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@email.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="*****"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-600">Esqueceu a senha?</a>
            </div>

            <Button type="submit" size="lg" className="w-full shadow-elevation-2 uppercase tracking-wide">Fazer login</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

