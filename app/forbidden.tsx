import { Button, Result } from "antd"
import type React from "react"

const _Forbidden: React.FC = () => {
    return (
        <Result
            title={"无权限"}
            subTitle={"无权访问该页面"}
            extra={
                <Button type={"primary"} href={"/"}>
                    返回主页
                </Button>
            }
        ></Result>
    )
}
