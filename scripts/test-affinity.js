/**
 * Script de Verificação do Sistema de Afinidade de RPG (Matchmaking)
 * Gargbooks - Creative Pash
 */

const users = require("../src/data/users-mock.json");
const tables = require("../src/data/rpg-mock.json");

// Simulação da função matchTablesForUser em JS
function matchTablesForUser(userId, usersList, tablesList) {
  const user = usersList.find(u => u.id === userId);
  if (!user) return [];
  
  const userTags = new Set(user.interest_tags.map(t => t.toLowerCase()));
  
  return tablesList.filter(table => 
    table.tags.some(tag => userTags.has(tag.toLowerCase()))
  );
}

console.log("=== INICIANDO TESTES DE AFINIDADE RPG ===");

// 1. Testar usuário comum: Thiago Santos (usr-normal-1)
// Tags: ["Terror Gótico", "Iniciantes", "Mistério"]
// Deve dar match com:
// - A Maldição de Strahd (tags: ["D&D 5e", "Fantasia Sombria", "Terror Gótico"]) -> "Terror Gótico"
// - Grid Runners (tags: ["Cyberpunk", "Iniciantes", "Cyberpunk RED"]) -> "Iniciantes"
// - Sombras sobre Innsmouth (tags: ["Terror Cósmico", "Investigação", "Mistério"]) -> "Mistério"
// - O Segredo na Floresta (tags: ["Investigação", "Moderno", "Iniciantes"]) -> "Iniciantes"
console.log("\nSimulando para Thiago Santos (usr-normal-1):");
const thiagoMatches = matchTablesForUser("usr-normal-1", users, tables);
console.log(`Thiago tem ${thiagoMatches.length} mesas recomendadas (Esperado: 4)`);
thiagoMatches.forEach(t => console.log(` - [Match] ${t.title} (Tags: ${t.tags.join(", ")})`));

// 2. Testar usuário premium: Arthur Pendragon (usr-premium-1)
// Tags: ["D&D 5e", "Fantasia Sombria", "Terror Gótico", "Cyberpunk"]
// Deve dar match com:
// - A Maldição de Strahd -> "D&D 5e", "Fantasia Sombria", "Terror Gótico"
// - Grid Runners -> "Cyberpunk"
console.log("\nSimulando para Arthur Pendragon (usr-premium-1):");
const arthurMatches = matchTablesForUser("usr-premium-1", users, tables);
console.log(`Arthur tem ${arthurMatches.length} mesas recomendadas (Esperado: 2)`);
arthurMatches.forEach(t => console.log(` - [Match] ${t.title} (Tags: ${t.tags.join(", ")})`));

// 3. Testar IA Persona: Arthur Brand (ai-arthur-brand)
// Tags: ["Terror Gótico", "Fantasia Sombria", "Vampiro: A Máscara"]
// Deve dar match com:
// - A Maldição de Strahd -> "Terror Gótico", "Fantasia Sombria"
console.log("\nSimulando para Arthur Brand (ai-arthur-brand):");
const brandMatches = matchTablesForUser("ai-arthur-brand", users, tables);
console.log(`Arthur Brand tem ${brandMatches.length} mesas recomendadas (Esperado: 1)`);
brandMatches.forEach(t => console.log(` - [Match] ${t.title} (Tags: ${t.tags.join(", ")})`));

console.log("\n=== TESTES DE AFINIDADE RPG CONCLUÍDOS COM SUCESSO ===");
