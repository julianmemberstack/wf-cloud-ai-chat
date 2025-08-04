"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemberstack } from "@/contexts/memberstack-context";
import { LogOut, User, Settings } from "lucide-react";

export function UserMenu() {
  const { memberstack, member } = useMemberstack();

  const handleLogout = async () => {
    if (!memberstack) return;
    
    try {
      console.log('[UserMenu] Logging out user');
      await memberstack.logout();
      console.log('[UserMenu] Logout successful');
    } catch (error) {
      console.error('[UserMenu] Logout failed:', error);
    }
  };

  if (!member) return null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Welcome back!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Signed in as:</p>
          <p className="font-medium">{member.auth.email}</p>
          {member.customFields?.firstName && member.customFields?.lastName && (
            <p className="text-sm text-muted-foreground">
              {member.customFields.firstName} {member.customFields.lastName}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}