import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";
import { formatPrice, generateStarRating } from "@/lib/skincare-data";

interface ProductComparisonProps {
  skinType: string;
  concerns: string[];
  preferenceType: 'home-remedies' | 'products' | 'mixed';
}

export default function ProductComparison({ skinType, concerns, preferenceType }: ProductComparisonProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { skinTypes: [skinType], concerns, isHomeRemedy: preferenceType === 'home-remedies' }],
    enabled: !!skinType,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="product-grid">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recommendedProducts = products?.slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Recommended Products
        </h2>
        <p className="text-secondary">
          {preferenceType === 'home-remedies' 
            ? 'Natural ingredients and DIY recipes for your skin type'
            : 'Compare prices across retailers to find the best deals'
          }
        </p>
      </div>

      <div className="product-grid">
        {recommendedProducts.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-lg transition-shadow"
            data-testid={`product-card-${product.id}`}
          >
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <i className={`${product.isHomeRemedy ? 'fas fa-leaf' : 'fas fa-flask'} text-4xl text-primary/50`}></i>
              </div>
              {product.isHomeRemedy && (
                <Badge className="absolute top-2 left-2 bg-green-100 text-green-700">
                  DIY Recipe
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
              <p className="text-sm text-secondary mb-2">{product.brand}</p>
              
              {product.price && (
                <div className="text-xl font-bold text-primary mb-2">
                  {formatPrice(product.price)}
                  {product.isHomeRemedy && <span className="text-sm font-normal"> (ingredients)</span>}
                </div>
              )}
              
              {product.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-500" title={`${product.rating}/5 stars`}>
                    {generateStarRating(product.rating)}
                  </div>
                  <span className="text-sm text-secondary">({product.rating}/5)</span>
                </div>
              )}
              
              {product.instructions && (
                <p className="text-sm text-secondary mb-4 line-clamp-2">
                  {product.instructions}
                </p>
              )}
              
              <Button 
                className="w-full skincare-accent"
                data-testid={`button-${product.isHomeRemedy ? 'view-recipe' : 'compare-prices'}-${product.id}`}
              >
                <i className={`${product.isHomeRemedy ? 'fas fa-book' : 'fas fa-external-link-alt'} mr-2`}></i>
                {product.isHomeRemedy ? 'View Recipe' : 'Compare Prices'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
