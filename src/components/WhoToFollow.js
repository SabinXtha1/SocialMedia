'use server'

import { getRandomUser } from "@/action/user.action"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import Link from "next/link"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import FollowButton from "./FollowButton"

const WhoToFollow =async () => {
    const users = await getRandomUser()
    if(users.length === 0) return null
  return (
    <Card className='w-[250px]'>
    <CardHeader>
      <CardTitle>Who to Follow</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex gap-2 items-center justify-between ">
            <div className="flex items-center gap-1">
              <Link href={`/profile/${user.username}`}>
                <Avatar>
                  <AvatarImage src={user.image ?? "https://github.com/shadcn.png"} className="w-10 h-10" />
                </Avatar>
              </Link>
              <div className="text-xs">
                <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                  {user.name}
                </Link>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-muted-foreground">{user._count.followers}followers</p>
              </div>
            </div>
       
            <FollowButton userID={user.id}/>
          </div>
        ))}
      </div> 
    </CardContent>
  </Card>
  )
}

export default WhoToFollow 