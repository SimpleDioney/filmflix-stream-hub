import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { resetPassword, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }

    if (!token) {
      return;
    }

    const success = await resetPassword(token, newPassword);
    if (success) {
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Link inválido</h2>
            <p className="text-muted-foreground mb-4">
              O link para redefinição de senha é inválido ou expirou.
            </p>
            <Link to="/forgot-password">
              <Button>Solicitar novo link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Redefinir senha
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50 card-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Nova senha
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Digite sua nova senha
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {newPassword !== confirmPassword && confirmPassword && (
                <p className="text-sm text-destructive">As senhas não coincidem</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading || newPassword !== confirmPassword}
              >
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>

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

export default ResetPassword;