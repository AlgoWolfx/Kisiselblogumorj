import { Post } from './types';

export const featuredPosts: Post[] = [
  {
    id: 1,
    title: 'Getting Started with Next.js and TailwindCSS',
    slug: 'getting-started-with-nextjs-and-tailwindcss',
    excerpt: 'Learn how to set up a new project with Next.js 13 and TailwindCSS to create beautiful, responsive websites.',
    content: `<p>Next.js has become one of the most popular React frameworks for building modern web applications. When combined with TailwindCSS, it provides a powerful toolkit for creating beautiful, responsive interfaces with minimal effort.</p>
      <h2>Setting Up Your Project</h2>
      <p>To get started, you'll need to create a new Next.js project and install TailwindCSS:</p>
      <pre><code>npx create-next-app@latest my-blog
cd my-blog
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p</code></pre>
      <p>Next, you'll need to configure Tailwind by updating the <code>tailwind.config.js</code> file:</p>
      <pre><code>module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}</code></pre>
      <h2>Creating Your First Component</h2>
      <p>With your setup complete, you can start building components using TailwindCSS utility classes:</p>
      <pre><code>export function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
      {children}
    </button>
  );
}</code></pre>
      <p>This is just the beginning of what you can do with Next.js and TailwindCSS. Explore the documentation to learn more about advanced features and techniques.</p>`,
    author: 'Jane Doe',
    date: '2023-05-15',
    readTime: 5,
    coverImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Development',
    tags: ['next.js', 'tailwindcss', 'react'],
  },
  {
    id: 2,
    title: 'Creating Accessible UI Components',
    slug: 'creating-accessible-ui-components',
    excerpt: 'Accessibility is essential for creating inclusive web experiences. Learn how to build accessible UI components.',
    content: `<p>Building accessible web applications is not just a nice-to-have feature—it's essential for creating inclusive digital experiences that everyone can use, regardless of their abilities or disabilities.</p>
      <h2>Why Accessibility Matters</h2>
      <p>Accessibility (often abbreviated as a11y) ensures that people with disabilities can perceive, understand, navigate, and interact with your website. It's not just about compliance with legal requirements—it's about building better products for everyone.</p>
      <h2>Key Principles of Accessible Design</h2>
      <p>Here are some fundamental principles to keep in mind when designing accessible UI components:</p>
      <ul>
        <li>Provide sufficient color contrast between text and background</li>
        <li>Don't rely solely on color to convey information</li>
        <li>Ensure keyboard navigability for all interactive elements</li>
        <li>Add proper focus indicators for keyboard users</li>
        <li>Include descriptive alt text for images</li>
        <li>Use semantic HTML elements appropriately</li>
      </ul>
      <h2>Creating an Accessible Button Component</h2>
      <p>Let's create a simple but fully accessible button component:</p>
      <pre><code>function AccessibleButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}</code></pre>
      <p>This button includes proper focus styling and ARIA attributes to improve accessibility. Remember that accessibility is an ongoing process that requires testing and iteration.</p>`,
    author: 'John Smith',
    date: '2023-06-22',
    readTime: 7,
    coverImage: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Accessibility',
    tags: ['a11y', 'ui', 'design'],
  },
  {
    id: 3,
    title: 'Mastering CSS Grid Layout',
    slug: 'mastering-css-grid-layout',
    excerpt: 'CSS Grid has revolutionized web layout design. Learn how to create complex, responsive layouts with ease.',
    content: `<p>CSS Grid Layout is a two-dimensional layout system that has transformed how we design web layouts, making it possible to create complex grid-based designs with minimal HTML markup.</p>
      <h2>Understanding CSS Grid Concepts</h2>
      <p>Before diving into code examples, let's understand some key CSS Grid concepts:</p>
      <ul>
        <li><strong>Grid Container</strong>: The element on which <code>display: grid</code> is applied</li>
        <li><strong>Grid Items</strong>: The direct children of the grid container</li>
        <li><strong>Grid Lines</strong>: The horizontal and vertical lines that divide the grid</li>
        <li><strong>Grid Tracks</strong>: The space between two adjacent grid lines (rows or columns)</li>
        <li><strong>Grid Cell</strong>: The intersection of a row and column</li>
        <li><strong>Grid Area</strong>: The space surrounded by four grid lines</li>
      </ul>
      <h2>Creating a Basic Grid</h2>
      <p>Here's how to create a simple 3x3 grid:</p>
      <pre><code>.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 100px);
  gap: 20px;
}</code></pre>
      <h2>Placement and Alignment</h2>
      <p>One of the powerful features of CSS Grid is the ability to precisely control the placement of items:</p>
      <pre><code>.grid-item-1 {
  grid-column: 1 / 3; /* Start at line 1, end at line 3 */
  grid-row: 1 / 2;    /* Start at line 1, end at line 2 */
}

.grid-item-2 {
  grid-area: 2 / 1 / 4 / 2; /* row-start/column-start/row-end/column-end */
}</code></pre>
      <p>With CSS Grid, responsive layouts become much easier to implement, especially when combined with media queries and modern CSS features like minmax() and auto-fill/auto-fit.</p>`,
    author: 'Alex Johnson',
    date: '2023-07-10',
    readTime: 6,
    coverImage: 'https://images.pexels.com/photos/5082581/pexels-photo-5082581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'CSS',
    tags: ['css', 'layout', 'responsive'],
  },
];

export const posts: Post[] = [
  ...featuredPosts,
  {
    id: 4,
    title: 'State Management in React Applications',
    slug: 'state-management-in-react-applications',
    excerpt: 'Explore different state management approaches in React, from useState and useContext to Redux and Zustand.',
    content: `<p>State management is one of the most important aspects of building React applications. As applications grow in complexity, managing state becomes increasingly challenging.</p>
      <h2>Local State with useState</h2>
      <p>For simple components, React's built-in useState hook is often sufficient:</p>
      <pre><code>function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}</code></pre>
      <h2>Sharing State with Context API</h2>
      <p>When you need to share state across components without prop drilling, the Context API is a great solution:</p>
      <pre><code>// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer component
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}
    >
      Toggle Theme
    </button>
  );
}</code></pre>
      <h2>External State Management Libraries</h2>
      <p>For complex applications, you might consider using libraries like Redux, Zustand, or Jotai. Here's a simple example using Zustand:</p>
      <pre><code>// Create store
import create from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Use in component
function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}</code></pre>
      <p>Choosing the right state management approach depends on your application's size, complexity, and team preferences. Start simple and add complexity only when needed.</p>`,
    author: 'Emily Chen',
    date: '2023-08-05',
    readTime: 8,
    coverImage: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'React',
    tags: ['react', 'state-management', 'hooks'],
  },
  {
    id: 5,
    title: 'Building a Dark Mode Toggle',
    slug: 'building-a-dark-mode-toggle',
    excerpt: 'Learn how to implement a dark mode toggle in your web application using CSS variables and JavaScript.',
    content: `<p>Dark mode has become an essential feature in modern web applications. It not only provides a better viewing experience in low-light environments but also helps reduce eye strain and save battery life on OLED screens.</p>
      <h2>Setting Up CSS Variables</h2>
      <p>First, we'll define our color scheme using CSS variables:</p>
      <pre><code>:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #3B82F6;
  --secondary-color: #10B981;
}

[data-theme='dark'] {
  --bg-color: #1F2937;
  --text-color: #F9FAFB;
  --primary-color: #60A5FA;
  --secondary-color: #34D399;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}</code></pre>
      <h2>Creating the Toggle Component</h2>
      <p>Next, let's create a React component for the dark mode toggle:</p>
      <pre><code>function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    }
  }, []);
  
  useEffect(() => {
    // Apply theme to document and save preference
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  );
}</code></pre>
      <h2>Handling User Preferences</h2>
      <p>It's important to respect the user's system preferences while also allowing them to override those preferences. The code above does both by checking for saved preferences first, then falling back to system preferences.</p>
      <p>Remember to test your dark mode implementation across different browsers and devices to ensure a consistent experience for all users.</p>`,
    author: 'Sarah Kim',
    date: '2023-09-12',
    readTime: 6,
    coverImage: 'https://images.pexels.com/photos/5082567/pexels-photo-5082567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'UI/UX',
    tags: ['dark-mode', 'css', 'accessibility'],
  },
  {
    id: 6,
    title: 'Introduction to GraphQL',
    slug: 'introduction-to-graphql',
    excerpt: 'Discover the benefits of GraphQL over traditional REST APIs and learn how to build your first GraphQL API.',
    content: `<p>GraphQL is a query language for APIs that was developed by Facebook in 2015. Unlike REST, GraphQL gives clients the power to ask for exactly what they need, making it possible to get all required data in a single request.</p>
      <h2>Key Concepts in GraphQL</h2>
      <p>Before diving into implementation, let's understand some key GraphQL concepts:</p>
      <ul>
        <li><strong>Schema</strong>: Defines the types of data available and the relationships between them</li>
        <li><strong>Queries</strong>: Used to request data from the server</li>
        <li><strong>Mutations</strong>: Used to modify server-side data</li>
        <li><strong>Resolvers</strong>: Functions that determine how the fields in the schema are executed</li>
        <li><strong>Subscriptions</strong>: Enable real-time updates when data changes</li>
      </ul>
      <h2>Setting Up a Simple GraphQL Server</h2>
      <p>Let's create a basic GraphQL server using Apollo Server and Node.js:</p>
      <pre><code>const { ApolloServer, gql } = require('apollo-server');

// Define schema
const typeDefs = gql\`
  type Book {
    id: ID!
    title: String!
    author: String!
    publishedYear: Int
  }
  
  type Query {
    books: [Book]
    book(id: ID!): Book
  }
\`;

// Sample data
const books = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publishedYear: 1925 },
  { id: '2', title: '1984', author: 'George Orwell', publishedYear: 1949 },
];

// Define resolvers
const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(book => book.id === id),
  },
};

// Create server
const server = new ApolloServer({ typeDefs, resolvers });

// Start server
server.listen().then(({ url }) => {
  console.log(\`Server ready at \${url}\`);
});</code></pre>
      <h2>Making GraphQL Queries</h2>
      <p>With our server running, we can now make queries like this:</p>
      <pre><code>query {
  books {
    title
    author
  }
}</code></pre>
      <p>This would return only the title and author of each book, even though our database might contain more information. This is the power of GraphQL—clients can request exactly the data they need.</p>
      <p>GraphQL offers many more features and capabilities, including input validation, error handling, and integration with various data sources. As you become more comfortable with the basics, you can explore these advanced topics.</p>`,
    author: 'Michael Brown',
    date: '2023-10-20',
    readTime: 9,
    coverImage: 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'API',
    tags: ['graphql', 'api', 'backend'],
  },
  {
    id: 7,
    title: 'Performance Optimization Techniques',
    slug: 'performance-optimization-techniques',
    excerpt: 'Learn practical techniques to improve your website\'s performance and provide a better user experience.',
    content: `<p>Website performance is a critical aspect of user experience. Slow websites lead to higher bounce rates, lower conversion rates, and can even impact your search engine rankings.</p>
      <h2>Image Optimization</h2>
      <p>Images often account for the majority of a webpage's size. Here are some techniques to optimize them:</p>
      <ul>
        <li>Use modern formats like WebP or AVIF which offer better compression</li>
        <li>Implement responsive images using srcset and sizes attributes</li>
        <li>Lazy load images that are not in the initial viewport</li>
        <li>Consider using image CDNs that can optimize on-the-fly</li>
      </ul>
      <pre><code>&lt;img
  src="small.jpg"
  srcset="small.jpg 500w, medium.jpg 1000w, large.jpg 1500w"
  sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
  loading="lazy"
  alt="Description"
/&gt;</code></pre>
      <h2>JavaScript Optimization</h2>
      <p>JavaScript can significantly impact your site's time-to-interactive. Consider these optimization techniques:</p>
      <ul>
        <li>Code-splitting to load only what's needed for the current page</li>
        <li>Tree-shaking to eliminate unused code</li>
        <li>Deferring non-critical JavaScript</li>
        <li>Using web workers for CPU-intensive tasks</li>
      </ul>
      <h2>Implementing Code-Splitting in React</h2>
      <pre><code>// Before code-splitting
import HeavyComponent from './HeavyComponent';

// After code-splitting
import { lazy, Suspense } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}</code></pre>
      <h2>CSS Optimization</h2>
      <p>Optimizing your CSS can help reduce render-blocking resources:</p>
      <ul>
        <li>Remove unused CSS</li>
        <li>Inline critical CSS</li>
        <li>Use CSS containment to isolate parts of the page</li>
        <li>Consider atomic CSS approaches like Tailwind</li>
      </ul>
      <h2>Measuring Performance</h2>
      <p>Always measure the impact of your optimizations using tools like Lighthouse, WebPageTest, or Chrome DevTools. Focus on metrics that matter to users, such as:</p>
      <ul>
        <li>First Contentful Paint (FCP)</li>
        <li>Largest Contentful Paint (LCP)</li>
        <li>First Input Delay (FID)</li>
        <li>Cumulative Layout Shift (CLS)</li>
      </ul>
      <p>Remember that performance optimization is an ongoing process, not a one-time task. Regular monitoring and improvements are essential to maintain a fast website as your content and codebase evolve.</p>`,
    author: 'David Lee',
    date: '2023-11-15',
    readTime: 10,
    coverImage: 'https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Performance',
    tags: ['optimization', 'web-performance', 'user-experience'],
  },
  {
    id: 8,
    title: 'Building a Custom React Hook',
    slug: 'building-a-custom-react-hook',
    excerpt: 'Learn how to create reusable logic with custom React hooks and improve your component structure.',
    content: `<p>Custom React hooks allow you to extract component logic into reusable functions. They're a powerful way to share stateful logic between components without changing your component hierarchy.</p>
      <h2>Understanding React Hooks</h2>
      <p>Before creating custom hooks, it's important to understand the basic hooks provided by React:</p>
      <ul>
        <li><code>useState</code>: Adds state to functional components</li>
        <li><code>useEffect</code>: Performs side effects in components</li>
        <li><code>useContext</code>: Accesses context values</li>
        <li><code>useReducer</code>: Manages complex state logic</li>
        <li><code>useRef</code>: Creates mutable references</li>
      </ul>
      <p>Custom hooks are simply JavaScript functions that can use these built-in hooks and follow two conventions:</p>
      <ol>
        <li>Their names start with "use" (e.g., <code>useCustomHook</code>)</li>
        <li>They can call other hooks</li>
      </ol>
      <h2>Creating a useLocalStorage Hook</h2>
      <p>Let's create a custom hook that syncs state with localStorage:</p>
      <pre><code>import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Update localStorage when storedValue changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}</code></pre>
      <h2>Using the Custom Hook</h2>
      <p>Now we can use our <code>useLocalStorage</code> hook in any component:</p>
      <pre><code>function PreferencesForm() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);
  
  return (
    <form>
      <div>
        <label htmlFor="theme">Theme:</label>
        <select 
          id="theme" 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="fontSize">Font Size:</label>
        <input 
          type="number" 
          id="fontSize" 
          value={fontSize} 
          onChange={(e) => setFontSize(Number(e.target.value))} 
        />
      </div>
    </form>
  );
}</code></pre>
      <h2>Creating a useMediaQuery Hook</h2>
      <p>Let's create another custom hook for responsive design:</p>
      <pre><code>import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}</code></pre>
      <p>Custom hooks are a powerful pattern in React that helps you create reusable, clean, and maintainable code. They encourage good practices like separating concerns and keeping components focused on their primary responsibilities.</p>`,
    author: 'Rachel Green',
    date: '2023-12-05',
    readTime: 7,
    coverImage: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'React',
    tags: ['react', 'hooks', 'javascript'],
  },
];