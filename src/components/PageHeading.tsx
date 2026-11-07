import type { LucideIcon } from "lucide-react";

function PageHeading({ icon: Icon, title, description }: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return <header className="ph-page-heading">
        <span className="ph-page-icon"><Icon size={31} /></span>
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    </header>;
}

export default PageHeading;
