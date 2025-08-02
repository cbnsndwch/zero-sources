import { useState } from "react";
import { Settings, Plus, User, Clock, Download, Keyboard, HelpCircle, LogOut, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const workspaces = [{
  id: "main",
  name: "ZRocket",
  avatar: "ZR",
  active: true
}, {
  id: "design",
  name: "Design Team",
  avatar: "DT"
}, {
  id: "dev",
  name: "Development",
  avatar: "DV"
}];

export function WorkspaceSidebar() {
  const [activeWorkspace, setActiveWorkspace] = useState("main");
  const [userStatus] = useState("online");

  return (
    <div className="w-12 flex flex-col items-center py-3 space-y-3">
      {/* Workspace Avatars */}
      {workspaces.map(workspace => {
        const isActive = activeWorkspace === workspace.id;
        return (
          <Avatar
            key={workspace.id}
            className={`h-8 w-8 cursor-pointer transition-opacity rounded-lg ${
              isActive ? "ring-2 ring-primary" : "hover:opacity-80"
            }`}
            onClick={() => setActiveWorkspace(workspace.id)}
          >
            <AvatarFallback 
              className={`text-xs font-medium rounded-lg ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {workspace.avatar}
            </AvatarFallback>
          </Avatar>
        );
      })}

      {/* Add Workspace */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground mt-2 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Settings */}
      <div className="flex-1" />

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">U</AvatarFallback>
            </Avatar>
            <Circle 
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                userStatus === "online" ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
              }`} 
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56 mb-2">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">User</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Circle 
                  className={`h-2 w-2 rounded-full ${
                    userStatus === "online" ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                  }`} 
                />
                {userStatus === "online" ? "Active" : "Away"}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Clock className="h-4 w-4 mr-2" />
            Set status
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Download apps
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Keyboard className="h-4 w-4 mr-2" />
            Keyboard shortcuts
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & support
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
