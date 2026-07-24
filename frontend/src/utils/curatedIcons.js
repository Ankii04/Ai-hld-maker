/**
 * Curated subset of react-icons/si names shown as the Canvas icon search
 * panel's default view (before the user types a search query).
 *
 * IMPORTANT: this file intentionally holds only plain strings, not React
 * component imports. Rollup/Vite will NOT split a dynamically-imported
 * module (`import('react-icons/si')`, used lazily elsewhere) into its own
 * chunk if anything else in the app also statically imports named bindings
 * from that same module — it just gets merged back into whichever chunk
 * held the static import, silently defeating the lazy-load. Keeping every
 * reference to the actual icon components behind the single shared lazy
 * loader in `iconLoader.js` is what actually keeps react-icons/si (~3,400
 * components) out of the main and editor bundles.
 */
export const CURATED_ICON_NAMES = [
  'SiGooglecloud', 'SiDocker', 'SiKubernetes',
  'SiPostgresql', 'SiMongodb', 'SiRedis', 'SiMysql', 'SiSqlite', 'SiElasticsearch',
  'SiApachekafka', 'SiRabbitmq', 'SiNginx', 'SiApache', 'SiReact', 'SiVuedotjs',
  'SiAngular', 'SiSvelte', 'SiNodedotjs', 'SiPython', 'SiGo', 'SiRust', 'SiTypescript',
  'SiJavascript', 'SiCss', 'SiHtml5', 'SiTailwindcss', 'SiGraphql', 'SiApollographql',
  'SiVercel', 'SiNetlify', 'SiDigitalocean', 'SiCloudflare', 'SiFirebase',
  'SiSupabase', 'SiLinux', 'SiUbuntu', 'SiApple', 'SiAndroid',
  'SiGithub', 'SiGitlab', 'SiBitbucket', 'SiJira', 'SiConfluence', 'SiDiscord',
  'SiJenkins', 'SiTerraform', 'SiPrometheus', 'SiGrafana', 'SiWebpack', 'SiVite',
]
