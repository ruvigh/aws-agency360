"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";

import { usePathname } from "next/navigation";
import { Container, ContentLayout, Header, HelpPanel, Link } from "@cloudscape-design/components";

/* export const metadata: Metadata = {
  title: "AWS Agency360",
  description: "AWS Agency360 Application",
}; */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const pathname                = usePathname();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    // Always start with Home
    const items = [{ text: 'Home', href: '/' }];
    
    // Add path segments as breadcrumbs
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      items.push({
        text: path.charAt(0).toUpperCase() + path.slice(1),
        href: currentPath
      });
    });
    
    return items;
  };

  const defaultLogo = "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Ministry_of_Education_%28Singapore%29_logo.svg/640px-Ministry_of_Education_%28Singapore%29_logo.svg.png";

  const logo_url = defaultLogo

  return (
    <html lang="en">
      <body>
        <AppLayout
          breadcrumbs={<BreadcrumbGroup items={getBreadcrumbs()} />}
          navigation={
            <SideNavigation
              
              header={{
                href: "/",
                text: "Ministry of Education",
                logo: {
                    src: logo_url,
                    alt: "AWS Logo"
                  }
              }}
              items={[
                {
                  type: "section",
                  text: "Agency 360",
                  items: [
                    {
                      type: "link",
                      text: "Manage Accounts",
                      href: "/agency360/accounts"
                    },
                    {
                      type: "link", 
                      text: "Manage Products",
                      href: "/agency360/products"
                    }
                  ]
                },
                {
                  type: "divider"
                },
                {
                  type: "section",
                  text: "AI Initiatives",
                  items: [
                    {
                      type: "link",
                      text: "AwSistant",
                      href: "/agency360/accounts"
                    },
                    {
                      type: "link", 
                      text: "Principal",
                      href: "/agency360/products"
                    }
                  ]
                }
              ]}
            />
          }
          /* content={children}, */
          toolsOpen={false}
          tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
          content={
            <ContentLayout>
              <div className="contentPlaceholder" >
                {children}
              </div>
            </ContentLayout>
          }
        />
      </body>
    </html>
  );
}

