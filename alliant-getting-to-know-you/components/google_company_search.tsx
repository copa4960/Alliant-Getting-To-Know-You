import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface GoogleCompanySearchProps {
    name: string;
    company: string; // Ensure both props are defined
}

const GoogleCompanySearch: React.FC<GoogleCompanySearchProps> = async ({ name, company }) => {
    try {
        const googleApiPath = "../google company file.py";
        const aiSummary = "./components/GetPageWithAISummary.py"

        // Execute the Google API Python script with the search query
        const { stdout: companyLink, stderr: linkError } = await execAsync(
            `python "${googleApiPath}" "${name}" "${company}"`
        );

        if (linkError) {
            console.error("Google API Script Error:", linkError);
            return <p>Error executing company website search</p>;
        }

        const { stdout: aiResults, stderr: aiError } = await execAsync(
            `python "${aiSummary}" "${name}" "${companyLink}"`,
        );

        if (aiError) {
            console.error("Google API Script Error:", aiError);
            return <p>Error executing ai summary</p>;
        }

        return (
            <div>
                <p className="text-center text-md mt-2"> Company website found: </p>
                <a
                    href={companyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    {companyLink}
                </a>
                <p className="text-center text-md mt-2"> AI Summary: </p>
                <a>
                    {aiResults}
                </a>
            </div>
        );
    } catch (error) {
        console.error("Error during Google API search:", error);
        return <p>Error during search</p>;
    }
};

export default GoogleCompanySearch;
