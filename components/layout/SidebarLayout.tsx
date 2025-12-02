"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Calculator, HelpCircle, Home, LogOut, Menu, MessageSquare, Settings, Users,} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuth} from "@/context/AuthContext";
import React from "react";
import {DialogTitle} from "@radix-ui/react-dialog";
import {DialogDescription} from "@/components/ui/dialog";

const navItems = [
    {
        label: "Propiedades",
        href: "/properties",
        icon: Home,
    },
    {
        label: "Clientes",
        href: "/customers",
        icon: Users,
    },
    {
        label: "Simulaciones",
        href: "/simulations",
        icon: Calculator,
    },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { state, signOut } = useAuth();

    const username = state.user?.username ?? "Usuario";

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* MOBILE MENU BUTTON */}
            <div className="lg:hidden p-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left" className="p-0 w-64">
                        <DialogTitle className="sr-only">Menú lateral</DialogTitle>
                        <DialogDescription className="sr-only">
                            Navegación lateral de la aplicación
                        </DialogDescription>
                        <Sidebar
                            navItems={navItems}
                            pathname={pathname}
                            username={username}
                            signOut={signOut}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex w-64 border-r bg-white">
                <Sidebar
                    navItems={navItems}
                    pathname={pathname}
                    username={username}
                    signOut={signOut}
                />
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
    );
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

function Sidebar({
                     navItems,
                     pathname,
                     username,
                     signOut,
                 }: {
    navItems: NavItem[];
    pathname: string;
    username: string;
    signOut: () => void;
}) {
    const router = useRouter();

    const handleLogout = () => {
        signOut();
        router.replace("/login");
    };

    return (
        <div className="flex flex-col h-full">
            {/* LOGO */}
            <div className="h-16 flex items-center px-6 border-b">
                {/* 🔹 Llevo el logo a /simulations para que sea el “home” de créditos */}
                <Link href="/simulations" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <Home className="text-white w-6 h-6" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
            Proyecto Hogar
          </span>
                </Link>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition 
              ${
                                active
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="mt-6 pt-4 border-t">
                    <Link
                        href="/configuration"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Settings className="w-5 h-5" />
                        Configuración
                    </Link>
                </div>
            </nav>

            {/* USER FOOTER */}
            <div className="p-4 border-t space-y-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>

                            <div className="text-left">
                                <p className="text-sm font-medium">{username}</p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="top" className="w-56">
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 gap-2 text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-gray-600">
                        <HelpCircle className="w-4 h-4" />
                        Ayuda
                    </Button>
                </div>
            </div>
        </div>
    );
}
