/**
 * Serviço de armazenamento local fortemente tipado com tratamento de erros,
 * fallbacks seguros e controle de cota de armazenamento (QuotaExceededError).
 */

export const storageService = {
  /**
   * Carrega um item do localStorage e faz o parse em JSON com validação de tipo.
   */
  loadItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }

      const parsed = JSON.parse(raw);
      // Se o defaultValue for um objeto simples, realiza merge para assegurar campos novos
      if (
        defaultValue &&
        typeof defaultValue === 'object' &&
        !Array.isArray(defaultValue) &&
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return { ...defaultValue, ...parsed };
      }

      return parsed as T;
    } catch (error) {
      console.warn(`[storageService] Falha ao ler a chave "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Salva um valor serializado em JSON no localStorage.
   * Retorna true se a gravação foi bem-sucedida, false se falhou ou estourou a cota.
   */
  saveItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      if (
        error?.name === 'QuotaExceededError' ||
        error?.code === 22 ||
        error?.code === 1014
      ) {
        console.error(
          `[storageService] Cota do localStorage excedida ao tentar salvar "${key}".`,
          error
        );
      } else {
        console.error(`[storageService] Erro ao gravar "${key}":`, error);
      }
      return false;
    }
  },

  /**
   * Remove uma chave do localStorage.
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storageService] Erro ao remover a chave "${key}":`, error);
    }
  }
};
