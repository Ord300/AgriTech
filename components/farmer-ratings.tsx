"use client"

import { useData } from "@/lib/data-context"
import { StarRating } from "./star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FarmerRatingsProps {
  farmerId: string
}

export function FarmerRatings({ farmerId }: FarmerRatingsProps) {
  const { ratings } = useData()
  const farmerRatings = ratings.filter((r) => r.farmerId === farmerId)

  if (farmerRatings.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Aucun avis pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">
          {(farmerRatings.reduce((acc, r) => acc + r.stars, 0) / farmerRatings.length).toFixed(1)}
        </div>
        <div>
          <StarRating 
            rating={farmerRatings.reduce((acc, r) => acc + r.stars, 0) / farmerRatings.length} 
            size="lg" 
          />
          <p className="text-sm text-muted-foreground">{farmerRatings.length} avis</p>
        </div>
      </div>

      <div className="divide-y">
        {farmerRatings.map((rating) => (
          <div key={rating.id} className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{rating.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{rating.authorName}</p>
                <p className="text-xs text-muted-foreground">{rating.createdAt}</p>
              </div>
              <div className="ml-auto">
                <StarRating rating={rating.stars} size="sm" />
              </div>
            </div>
            <p className="text-sm text-gray-700">{rating.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
