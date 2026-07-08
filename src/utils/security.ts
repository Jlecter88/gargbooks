import { User } from "./rpgMatchmaker";

/**
 * Valida se um usuário (actor) tem permissão para editar as informações ou
 * tags de outro usuário (targetUser).
 * 
 * Regra: Um usuário normal não pode alterar dados de uma persona de IA.
 * Apenas o próprio usuário (ou a própria IA, no contexto do orquestrador)
 * pode editar seu perfil.
 */
export function canEditProfile(actor: User | null, targetUser: User): boolean {
  if (!actor) return false;
  
  // Se for o próprio perfil, pode editar
  if (actor.id === targetUser.id) {
    return true;
  }
  
  // Se o alvo for uma persona de IA e quem está tentando editar não é a própria IA, bloqueia
  if (targetUser.is_ai_persona) {
    return false;
  }
  
  // Caso contrário, em ambiente local simulado, permite
  return true;
}

/**
 * Valida se o usuário logado (actor) tem permissão para simular ou assumir
 * a identidade de outro usuário (targetUser) no painel de testes.
 * 
 * Regra: Um usuário comum não pode simular/assumir a identidade de uma persona de IA protegida.
 * Apenas a própria persona ou administradores autorizados poderiam. Na simulação, bloqueamos
 * usuários comuns de selecionar a persona de IA se não forem ela.
 */
export function canSimulateIdentity(actor: User | null, targetUser: User): boolean {
  if (!actor) return true; // Se não tem ninguém logado, pode simular qualquer um para iniciar o teste
  
  // Se o alvo for uma persona de IA e o actor atual for um usuário comum, bloqueia o sequestro de identidade
  if (targetUser.is_ai_persona && !actor.is_ai_persona && actor.id !== targetUser.id) {
    return false;
  }
  
  return true;
}

/**
 * Verifica o acesso a conteúdo adulto (+18).
 * Retorna true apenas se age_verified e is_premium forem estritamente verdadeiros.
 */
export function verifyAdultAccess(user: User | null): boolean {
  if (!user) return false;
  return user.age_verified === true && user.is_premium === true;
}
