import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f4]">

      <nav className="bg-white border-b w-full">
        <div className="flex justify-between items-center px-3 md:px-4 py-2">
          <span className="font-semibold text-lg">Shape</span>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              New form
            </Button>
            <div className="w-8 h-8 rounded-full bg-[#9aa0a6]" />
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        <div className="px-3 md:px-4 py-4">

          <div className="flex justify-between items-center mb-3">
            <h5 className="text-lg font-semibold mb-0">Recent forms</h5>
            <Button variant="link" className="p-0 text-sm">
              View all
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">

            {[...Array(60)].map((_, i) => (
              <Card
                key={i}
                className="
                  cursor-pointer
                  transition-transform transition-shadow
                  duration-150
                  hover:-translate-y-0.5 hover:shadow-lg
                  h-full
                "
              >

                <div className="h-30 bg-gray-300 border-b border-gray-300" />

                <CardContent className="p-2">
                  <h6 className="text-[0.95rem] font-medium truncate mb-1">
                    Shape Survey {i + 1}
                  </h6>
                  <p className="text-sm text-gray-500 mb-0">
                    Opened 2 days ago
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
