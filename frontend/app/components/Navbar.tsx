'use client'

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@nextui-org/react'
import { usePathname } from 'next/navigation'

export default function AppNavbar() {
  const pathname = usePathname()

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link href="/" className="font-bold text-lg text-inherit">
          Bunny CDN Upload
        </Link>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={pathname === '/'}>
          <Link 
            href="/" 
            color={pathname === '/' ? 'success' : 'foreground'}
          >
            Upload
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname === '/preview'}>
          <Link 
            href="/preview" 
            color={pathname === '/preview' ? 'success' : 'foreground'}
          >
            Preview
          </Link>
        </NavbarItem>
      </NavbarContent>
      
    </Navbar>
  )
}