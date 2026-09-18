"use client"
import { useSession } from "next-auth/react"
import { Bell, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { getInitials } from "@/lib/utils"

export function Header({ title }: { title?: string }) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const user = session?.user

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-3.5 flex items-center justify-between">
      <div>
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {user?.name ? getInitials(user.name) : "?"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{(user?.role as string)?.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </header>
  )
}