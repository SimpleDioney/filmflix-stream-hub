import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Key, Ban, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_banned: boolean;
}

const AdminUsers = () => {
  const { isAdmin, token } = useAuth();
  const { call } = useApi();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/browse" replace />;
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await call('admin/users');
      setUsers(response);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (userId: number, currentBannedStatus: boolean) => {
    try {
      setActionLoading(userId);
      await call('admin/toggle-ban', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      
      toast({
        title: "Sucesso",
        description: `Usuário ${currentBannedStatus ? 'desbanido' : 'banido'} com sucesso`,
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUserId || !newPassword) return;

    try {
      setActionLoading(selectedUserId);
      await call('admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ userId: selectedUserId, newPassword }),
      });
      
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });
      
      setPasswordModalOpen(false);
      setNewPassword('');
      setSelectedUserId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie usuários e configurações do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome de Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_banned ? "destructive" : "default"}>
                          {user.is_banned ? "Banido" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant={user.is_banned ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleToggleBan(user.id, user.is_banned)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              "..."
                            ) : user.is_banned ? (
                              <>
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Desbanir
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Banir
                              </>
                            )}
                          </Button>
                          
                          <Dialog 
                            open={passwordModalOpen && selectedUserId === user.id}
                            onOpenChange={(open) => {
                              setPasswordModalOpen(open);
                              if (!open) {
                                setSelectedUserId(null);
                                setNewPassword('');
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUserId(user.id)}
                              >
                                <Key className="w-4 h-4 mr-1" />
                                Alterar Senha
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Alterar senha de {user.username}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="newPassword">Nova Senha</Label>
                                  <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Digite a nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setPasswordModalOpen(false);
                                      setNewPassword('');
                                      setSelectedUserId(null);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleChangePassword}
                                    disabled={!newPassword || actionLoading === user.id}
                                  >
                                    {actionLoading === user.id ? "Alterando..." : "Alterar Senha"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;