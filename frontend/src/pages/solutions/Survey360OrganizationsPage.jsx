/**
 * Survey360 Organizations Page
 * Manage organizations with pricing tier limits
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Users,
  Trash2,
  Edit2,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  Settings,
  Crown,
  Shield,
  User,
  Eye,
  MoreVertical,
  Mail,
  UserPlus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuthStore, useOrgStore, useUIStore } from '../../store';
import survey360Api from '../../lib/survey360Api';
import { toast } from 'sonner';

const PLAN_LABELS = {
  free: { name: 'Free', color: 'bg-slate-500' },
  starter: { name: 'Starter', color: 'bg-blue-500' },
  pro: { name: 'Pro', color: 'bg-teal-500' },
  business: { name: 'Business', color: 'bg-purple-500' },
  enterprise: { name: 'Enterprise', color: 'bg-amber-500' },
};

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const ROLE_COLORS = {
  owner: 'text-amber-500',
  admin: 'text-purple-500',
  member: 'text-blue-500',
  viewer: 'text-gray-500',
};

export function Survey360OrganizationsPage() {
  const navigate = useNavigate();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const { token } = useAuthStore();
  const { currentOrg, organizations, setCurrentOrg, setOrganizations } = useOrgStore();

  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsRes, limitsRes] = await Promise.all([
        survey360Api.get('/organizations'),
        survey360Api.get('/organizations/limits/me'),
      ]);

      setOrganizations(orgsRes.data);
      setLimits(limitsRes.data);

      // Set current org if not set
      if (!currentOrg && orgsRes.data.length > 0) {
        setCurrentOrg(orgsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await survey360Api.post('/organizations', formData);
      toast.success('Organization created successfully!');
      setShowCreateDialog(false);
      setFormData({ name: '', description: '' });
      fetchData();

      // Set as current if first org
      if (organizations.length === 0) {
        setCurrentOrg(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setSubmitting(true);
    try {
      await survey360Api.patch(`/organizations/${selectedOrg.id}`, formData);
      toast.success('Organization updated successfully!');
      setShowEditDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await survey360Api.delete(`/organizations/${selectedOrg.id}`);
      toast.success('Organization deleted');

      // Update current org if deleted
      if (currentOrg?.id === selectedOrg.id) {
        const remaining = organizations.filter(o => o.id !== selectedOrg.id);
        setCurrentOrg(remaining[0] || null);
      }

      setShowDeleteDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitch = async (org) => {
    try {
      await survey360Api.post(`/organizations/${org.id}/switch`);
      setCurrentOrg(org);
      toast.success(`Switched to ${org.name}`);
    } catch (error) {
      toast.error('Failed to switch organization');
    }
  };

  const loadMembers = async (org) => {
    try {
      const response = await survey360Api.get(`/organizations/${org.id}/members`);
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await survey360Api.post(`/organizations/${selectedOrg.id}/members`, inviteData);
      toast.success(response.data.message);
      setShowInviteDialog(false);
      setInviteData({ email: '', role: 'member' });
      loadMembers(selectedOrg);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to invite member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await survey360Api.delete(`/organizations/${selectedOrg.id}/members/${memberId}`);
      toast.success('Member removed');
      loadMembers(selectedOrg);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await survey360Api.patch(`/organizations/${selectedOrg.id}/members/${memberId}`, { role: newRole });
      toast.success('Role updated');
      loadMembers(selectedOrg);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[400px] ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  const planInfo = PLAN_LABELS[limits?.plan_id] || PLAN_LABELS.free;
  const usagePercent = limits?.organizations_limit === -1 
    ? 0 
    : (limits?.organizations_created / limits?.organizations_limit) * 100;

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-[#0a1628]' : 'bg-gray-50'}`} data-testid="organizations-page">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Organizations
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Create and manage your organizations
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            disabled={!limits?.can_create_more}
            className="bg-teal-500 hover:bg-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" /> New Organization
          </Button>
        </div>

        {/* Limits Card */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
                <Building2 className="w-5 h-5" /> Organization Limits
              </CardTitle>
              <Badge className={`${planInfo.color} text-white`}>{planInfo.name} Plan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Organizations Created</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {limits?.organizations_created || 0} / {limits?.organizations_limit === -1 ? '∞' : limits?.organizations_limit}
                  </span>
                </div>
                {limits?.organizations_limit !== -1 && (
                  <Progress value={usagePercent} className="h-2" />
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Members per Organization</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {limits?.members_per_org_limit === -1 ? 'Unlimited' : limits?.members_per_org_limit}
                  </span>
                </div>
              </div>
            </div>

            {!limits?.can_create_more && (
              <div className={`flex gap-3 p-4 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Organization limit reached</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upgrade your plan to create more organizations.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                    onClick={() => navigate('/solutions/survey360/pricing')}
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> View Plans
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => {
            const RoleIcon = ROLE_ICONS[org.role] || User;
            const isCurrentOrg = currentOrg?.id === org.id;

            return (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isCurrentOrg
                      ? 'border-teal-500 border-2 shadow-lg shadow-teal-500/10'
                      : isDark 
                        ? 'bg-white/5 border-white/10 hover:border-white/20' 
                        : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleSwitch(org)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCurrentOrg ? 'bg-teal-500' : isDark ? 'bg-white/10' : 'bg-gray-100'
                        }`}>
                          <span className={`text-xl font-bold ${isCurrentOrg ? 'text-white' : isDark ? 'text-white' : 'text-gray-700'}`}>
                            {org.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
                            {org.name}
                            {isCurrentOrg && (
                              <Badge variant="outline" className="text-xs border-teal-500 text-teal-500">
                                Current
                              </Badge>
                            )}
                          </CardTitle>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            /{org.slug}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrg(org);
                            setFormData({ name: org.name, description: org.description || '' });
                            setShowEditDialog(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrg(org);
                            loadMembers(org);
                            setShowMembersDialog(true);
                          }}>
                            <Users className="w-4 h-4 mr-2" /> Members
                          </DropdownMenuItem>
                          {org.role === 'owner' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrg(org);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {org.description || <span className="italic opacity-50">No description</span>}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <Users className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {org.member_count || 1} members
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${ROLE_COLORS[org.role]}`}>
                      <RoleIcon className="w-4 h-4" />
                      <span className="text-sm capitalize">{org.role}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}

          {/* Create New Card */}
          {limits?.can_create_more && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`border-dashed cursor-pointer transition-all min-h-[200px] flex items-center justify-center ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                    : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setShowCreateDialog(true)}
              >
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isDark ? 'bg-white/10' : 'bg-gray-100'
                  }`}>
                    <Plus className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Create Organization
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {limits?.remaining !== null ? `${limits.remaining} remaining` : 'Unlimited'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Empty State */}
        {organizations.length === 0 && (
          <Card className={`text-center py-12 ${isDark ? 'bg-white/5 border-white/10' : ''}`}>
            <CardContent>
              <Building2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No organizations yet
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Create your first organization to start collaborating
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-teal-500 hover:bg-teal-600">
                <Plus className="w-4 h-4 mr-2" /> Create Organization
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={isDark ? 'bg-[#0f1d32] border-white/10' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Name *</Label>
              <Input
                placeholder="My Organization"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={isDark ? 'bg-white/5 border-white/10' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Description</Label>
              <Textarea
                placeholder="What is this organization for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={isDark ? 'bg-white/5 border-white/10' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-teal-500 hover:bg-teal-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={isDark ? 'bg-[#0f1d32] border-white/10' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Edit Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={isDark ? 'bg-white/5 border-white/10' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={isDark ? 'bg-white/5 border-white/10' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="bg-teal-500 hover:bg-teal-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={isDark ? 'bg-[#0f1d32] border-white/10' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDark ? 'text-white' : ''}>
              Delete "{selectedOrg?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All surveys, responses, and members in this organization will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Organization'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className={`max-w-lg ${isDark ? 'bg-[#0f1d32] border-white/10' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>
              {selectedOrg?.name} - Members
            </DialogTitle>
            <DialogDescription>
              Manage team members and their roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {members.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role] || User;
              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        {member.name?.charAt(0) || member.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {member.name || 'Unknown'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'owner' ? (
                      <Badge className="bg-amber-500/20 text-amber-500 border-0">
                        <Crown className="w-3 h-3 mr-1" /> Owner
                      </Badge>
                    ) : selectedOrg?.role === 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleUpdateRole(member.id, value)}
                      >
                        <SelectTrigger className={`w-28 ${isDark ? 'bg-white/5 border-white/10' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {member.role}
                      </Badge>
                    )}
                    {member.role !== 'owner' && (selectedOrg?.role === 'owner' || selectedOrg?.role === 'admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {(selectedOrg?.role === 'owner' || selectedOrg?.role === 'admin') && (
              <Button
                onClick={() => {
                  setShowMembersDialog(false);
                  setShowInviteDialog(true);
                }}
                className="bg-teal-500 hover:bg-teal-600"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Invite Member
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowMembersDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className={isDark ? 'bg-[#0f1d32] border-white/10' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Invite Member</DialogTitle>
            <DialogDescription>
              Invite someone to join {selectedOrg?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Email *</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                className={isDark ? 'bg-white/5 border-white/10' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-gray-300' : ''}>Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
              >
                <SelectTrigger className={isDark ? 'bg-white/5 border-white/10' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Can manage members and settings</SelectItem>
                  <SelectItem value="member">Member - Can create and edit surveys</SelectItem>
                  <SelectItem value="viewer">Viewer - Can only view surveys and responses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={submitting} className="bg-teal-500 hover:bg-teal-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Survey360OrganizationsPage;
