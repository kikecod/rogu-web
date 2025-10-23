Directorio de hooks personalizados

Propósito:
- Centralizar hooks reutilizables y específicos de la app (p.ej. `useAuthState`, `useFetch`, `useDebounce`, `useSocket`, etc.).

Hooks recomendados:
- useAuthState: expone token/estado de autenticación y logout.
- useUser: obtiene el perfil del usuario (a partir de AuthContext o token).
- useFetch: wrapper para fetch con http-client, caché simple y abort controller.
- useDebounce: util para inputs de búsqueda.
- usePagination: helper para paginar listas y conectarlas con endpoints.

Buenas prácticas:
- Hooks deben ser puros y pequeños; delegar llamadas HTTP a servicios.
- Colocar hooks en `src/hooks` y exportarlos desde un index si son varios.
- Mantener tests unitarios para hooks con React Testing Library + jest.
