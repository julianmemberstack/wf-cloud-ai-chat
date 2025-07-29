"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Navbar.module.css";

export function Navbar({ as: _Component = _Builtin.NavbarWrapper }) {
  return (
    <_Component
      className={_utils.cx(_styles, "nav_component")}
      tag="div"
      config={{
        animation: "default",
        collapse: "medium",
        docHeight: false,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "padding-global")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "nav_container")}
          tag="div"
        >
          <_Builtin.NavbarBrand
            className={_utils.cx(_styles, "nav_brand")}
            options={{
              href: "#",
            }}
          >
            <_Builtin.Image
              className={_utils.cx(_styles, "nav_logo")}
              loading="lazy"
              width="auto"
              height="auto"
              alt=""
              src="https://cdn.prod.website-files.com/6888b2788c6b90ee629809ad/6888b2788c6b90ee62980a42_client-first-logo-white.svg"
            />
          </_Builtin.NavbarBrand>
          <_Builtin.NavbarMenu
            className={_utils.cx(_styles, "nav_menu")}
            tag="nav"
            role="navigation"
          >
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "nav_menu_link")}
              options={{
                href: "https://finsweet.com/client-first/docs",
              }}
            >
              {"Read the docs"}
            </_Builtin.NavbarLink>
            <_Builtin.NavbarLink
              className={_utils.cx(_styles, "nav_menu_link")}
              options={{
                href: "https://finsweet.com",
              }}
            >
              {"About Finsweet"}
            </_Builtin.NavbarLink>
          </_Builtin.NavbarMenu>
          <_Builtin.NavbarButton
            className={_utils.cx(_styles, "nav_button")}
            tag="div"
          >
            <_Builtin.Icon
              widget={{
                type: "icon",
                icon: "nav-menu",
              }}
            />
          </_Builtin.NavbarButton>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
