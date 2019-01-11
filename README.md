# Itelios Frontend Challenge

Neste Challenge resolvi implementá-lo de forma bem pura e OldSchool usando VanillaJS com alguns polyfills e Pure Css sem ferramentas auxiliares, apenas para realização do teste. O Micro-Projeto apresenta 2 pontos principais:

- Micro-Web-Components
	Desenvolvo interfaces ricas baseadas em componentes, nesse caso, criei algo com o mínimo de implementação, baseada em Classes, Templates-Inline e Eventos. Sem as funcionalidades avançadas em outros frameworks disponíveis no mercado como React, Angular, VueJs.

	Arvore de Componentes:
		:Component (Core)
			Component base para criação de novos.
		:ShoppingHistory (Histórica de compras)
			:ProductCard
				Produto Visto
			:RecommenedList 
				Carrosel de Produtos recomendados (3 por viewport do componente)
				[]ProductCard 
					Lista-Inline horizontal de produtos
				:Bullets
					Navegação de bullets atrelado ao carrosel que se atualiza dependendo da largura disponível do viewport do componente.

- Css
	Uso bem caseiro sem nenhum drama, com font-size relativo, media queries, animações/transitions e técnicas de resize suave + responsividade.