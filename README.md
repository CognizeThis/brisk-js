# brisk-js  
## A rapid HTML development framework and toolset
*Current Core Version:* [20.07.27](https://github.com/CognizeThis/brisk-js/releases/tag/v20.07.27)

*-Note: Currently, Brisk is dependent upon **JQuery**, in order to aid with compatibility issues. An independent version is planned for the future. But for now, as long as a version of Jquery is referenced before the Brisk library is loaded, it should work in conjunction with older sites quite well.*  

## What is Brisk?
**Brisk** is a library of tools and a framework which can be plugged into any existing web site and live with existing frameworks or can be used as the main method of client/server interation. It has been authored with both backward and forward compatibility in mind. Each method has been tested on mutiple versions of browsers; a list of browser compatiblity will be included with each method for help identifying the architectural use-cases upfront.

## Why is Brisk both a toolset, and a framework?
Bisk as a **library of Tools**, is designed to utilized as custom and dynamic attributes attached to HTML element markup. There are core attributes included with the main brisk library, as well as plugin attributes which are included as sepearte auto-loading javascript files (dubbed "*Cogs*"). These "Cogs" can be included by simply including the script file after including the main Brisk file. 3rd party "**custom attributes**" can be easily added by following the coding convention for cogs; which allows anyone to add a custom attribute to any HTML tag on the page, for futher dynamic extensibility.

Brisk as a **framework**, is a heavy server-side methodology; in that the intended use is that the majority of HTML content is rendered at the server and delivered through api "**view**" calls which are refreshed by other Brisk event calls. Routing is handled by hash appending data to the URL; so that the browser history can be kept, without causing redircts to be performed until desired. This makes it easy to begin using Brisk on a web site that may use other frameworks, as a "*plug-in*" option; or if the site creator desires to use the simplified Brisk ideology from the beginning, the site can be designed with a simplied nature in mind beforehand; creating a functional, non-static, "single-page" site with minimal effort.

## How does Brisk work?
Brisk works by watching all changes made to content on the active page. When new content is added or removed from the HTML page, any Brisk related tag attributes are parsed, loaded, and executed on new content automatically; Brisk content which has been removed, is cleaned from memory and disassociated from the page.

## Why use Brisk?
It is true that there are many frameworks out there which accomplish the same thing as Brisk; and one may wonder why you would want to add another framework to the massive pile already available. However, the reason to use Brisk are many, only some of which are:

1. Brisk is compatible with older web sites without a complete re-write of the foundation code on either the server or the client. This makes Brisk ideal for migrating a site to new code at a more managable pace.
2. Brisk works well with other framework features that are usually problematic (such as **``asp.net`` Update Panels**), this allows you to use the features of a newer site, side-by-side with older code.
3. Server-side content is more secure, since no secure content will ever be served or stored locally if the server is not in an authenticated state (**instantaneous access denial**).
4. The Learning curve for Brisk is extremely small, everything is handled from HTML as writing custom attributes on existing tags.
5. Setup is as simple as adding script resource tags (**minimal configuration**).
6. Very little JavaScript knowledge is needed; but advanced JavaScript users will also find the event handling system reduces the need for large amounts of client-side code.
7. The server-side nature of Brisk eliminates the need to maintain two or more sets of code which normally must duplicate validation logic and model object structures on both the server and client in order to match rules.
8. Brisk runs seamlessly with other JavaScript frameworks and tools.
9. The footprint for Brisk is miniscule; there is no need for on-demand JavaScript resource loaders, nor for package managers which transpile or manage libraries with hundreds of files.
10. The **stand-alone toolset** features can be extended to all browsers regardless of which device they are on; this allows for true cross-browser behavior.
11. It is simple to add new custom attributes and Brisk framework behaviors by adding your own **Cog** plug-in.
12. Use true REST API invocation directly and easily from the browser client. APIs are all server-side anyway, you mights as well have a frontend that understands this.

## Testimonials:

> "The list goes on! If you need a simple and rapid way to design new web sites or to update an old site without the need to re-code both the client and server to conform; then Brisk is the answer." -- Bryan Lyman (the creator of brisk-js)

```
```
# Documentation

Access the wiki for documention here --> 
[Documentation](https://github.com/CognizeThis/brisk-js/wiki)
```
  .-------------------------------------.
 /  .-.                             .-.  \
|  /   \                           /   \  |
| |\_.  |                         |    /| |
|\|  | /|      Documentation      |\  | |/|
| `---' |                         | `---' |
|       |                         |       |
|       |-------------------------|       |
\       |                         |       /
 \     /                           \     /
  `---'                             `---'
```
