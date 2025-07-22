import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await forgotPassword(email);
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background with cinematic effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card opacity-90" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            Recuperar senha
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50 card-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Esqueceu sua senha?
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {submitted 
                ? "Instruções enviadas!" 
                : "Digite seu e-mail para receber instruções de recuperação"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu e-mail"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar instruções'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Se houver uma conta associada a este e-mail, um link de redefinição de senha foi enviado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 DioneyFlix. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;