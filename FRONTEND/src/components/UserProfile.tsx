import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save, X } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    department: user?.department || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || '',
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{user.fullName}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              {user.studentId && (
                <Badge variant="outline">ID: {user.studentId}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            {isEditing ? (
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm py-2 px-3 bg-muted rounded-md">{user.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            {isEditing ? (
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm py-2 px-3 bg-muted rounded-md">{user.lastName}</p>
            )}
          </div>

          {user.role === 'lecturer' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{user.department || 'Not specified'}</p>
              )}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="space-y-3">
          <h4 className="font-medium">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Account Status:</span>
              <Badge variant={user.isActive ? "default" : "destructive"} className="ml-2">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Email Verified:</span>
              <Badge variant={user.emailVerified ? "default" : "secondary"} className="ml-2">
                {user.emailVerified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Last Login:</span>
              <span className="ml-2">
                {new Date(user.lastLogin).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Member Since:</span>
              <span className="ml-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 