# Endringer for å fikse knapper og logg inn-ikon

## 1. Oppdater globals.css

Legg til følgende kode i `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .login-button {
    @apply text-white hover:text-orange-100 transition-colors text-lg font-medium bg-white bg-opacity-20 px-4 py-2 rounded-full;
  }
  
  .nav-link {
    @apply text-white hover:text-orange-100 transition-colors text-lg font-medium;
  }
  
  .primary-button {
    @apply bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-lg;
  }
  
  .form-button {
    @apply bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full;
  }
}
```

## 2. Oppdater index.js

Endre logg inn-lenken i `pages/index.js` (rundt linje 47-57):

```jsx
{user ? (
  <>
    <span className="text-white text-lg">Hei, {user.email}</span>
    <button
      onClick={() => signOut()}
      className="nav-link"
    >
      Logg ut
    </button>
  </>
) : (
  <>
    <Link href="/login" legacyBehavior>
      <a className="login-button">
        Logg inn
      </a>
    </Link>
    <Link href="/register" legacyBehavior>
      <a className="nav-link">
        Registrer deg
      </a>
    </Link>
  </>
)}
```

Oppdater også den øverste navigasjonslenken (rundt linje 37):

```jsx
<Link href="#" legacyBehavior>
  <a className="nav-link">
    Våre medlemskap
  </a>
</Link>
```

Oppdater hovedknappen (rundt linje 70):

```jsx
<button 
  onClick={handleGenerateMeal}
  className="primary-button"
>
  {user ? 'La AI lage ditt perfekte måltid' : 'Logg inn for å starte'}
</button>
```

## 3. Oppdater login.js og register.js

Oppdater tilbake-lenken i `pages/login.js` (rundt linje 24):

```jsx
<Link href="/" legacyBehavior>
  <a className="nav-link">
    ← Tilbake til forsiden
  </a>
</Link>
```

Gjør samme endring i `pages/register.js`.

## 4. Oppdater AuthForm.js

Oppdater submit-knappen i `components/Auth/AuthForm.js` (rundt linje 75):

```jsx
<button
  className="form-button"
  type="submit"
  disabled={loading}
>
  {loading ? (
    'Laster...'
  ) : mode === 'login' ? (
    'Logg inn'
  ) : (
    'Registrer deg'
  )}
</button>
```
