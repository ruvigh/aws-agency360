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

import Head from "next/head";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const defaultLogo = "/images/aws_logo.png";
  const defaultAlt = "Amazon Web Services";
  const customerLogo = process.env.NEXT_PUBLIC_CUSTOMER_LOGO || defaultLogo;
  const customerName = process.env.NEXT_PUBLIC_CUSTOMER_NAME || defaultAlt;

  useEffect(() => {
    document.title = `${customerName || 'AWS'} - Agency360`;
    
  }, [customerName, customerLogo]);

  return (
    <html lang="en">
      <head>
        <title>Agency360</title>
        <link rel="icon" href="/images/favicon.png" />
        <meta name="description" content="Amazon Web Services - Public Sector - Demo Applications" />
      </head>
      <body>
        <AppLayout
        
          breadcrumbs={<BreadcrumbGroup items={getBreadcrumbs()} />}
          navigation={
            <SideNavigation
              
              header={{
                href: "/",
                text: customerName,
                logo: {
                    src: customerLogo,
                    alt: customerName
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
                      href: "/agency360/chat"
                    },
                    {
                      type: "link", 
                      text: "Principal",
                      href: "/agency360/products"
                    },
                    {
                      type: "link", 
                      text: "Chat Assistant",
                      href: "/agency360/chat"
                    }
                  ]
                }
              ]}
            />
          }
          /* content={children}, */
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

