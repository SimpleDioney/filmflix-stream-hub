import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/logo';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, login, register, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    login: '',
    password: '',
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.login, loginData.password);
    if (success) {
      // Navigation will happen automatically due to auth state change
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    
    const success = await register(registerData.username, registerData.email, registerData.password);
    if (success) {
      setActiveTab('login');
      setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
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
            Sua experiência de streaming premium
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50 card-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {activeTab === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Usuário ou E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Nome de usuário ou e-mail"
                        className="pl-10"
                        value={loginData.login}
                        onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>

                  <div className="text-center">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueci a senha?
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Nome de usuário</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Escolha um nome de usuário"
                        className="pl-10"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Seu e-mail"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Confirme sua senha"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  {registerData.password !== registerData.confirmPassword && registerData.confirmPassword && (
                    <p className="text-sm text-destructive">As senhas não coincidem</p>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading || registerData.password !== registerData.confirmPassword}
                  >
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      Ou{' '}
                      <Link to="/register" className="text-primary hover:underline">
                        criar conta em página separada
                      </Link>
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 DioneyFlix. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;