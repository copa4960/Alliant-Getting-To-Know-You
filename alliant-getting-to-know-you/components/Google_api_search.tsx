import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface GoogleApiSearchProps {
  query: string; // Accept query as a prop
}

export default async function GoogleApiSearch({ query }: GoogleApiSearchProps) {
  try {
    const googleApiPath = "../google api file.py";

    // Execute the Google API Python script with the search query
    const { stdout, stderr } = await execAsync(
      `python "${googleApiPath}" "${query}"`
    );

    if (stderr) {
      console.error("Google API Script Error:", stderr);
      return <p>Error executing Google API script</p>;
    }

    // Parse the output from the Python script
    const links = stdout.split('\n').filter(link => link); // Split by new line and filter out empty lines

    return (
      <div>
        <p className="text-center text-lg">
          Showing results for: <strong>{query}</strong>
        </p>
        <p className="text-center text-md mt-2">Top social media links found:</p>
        <ul className="mt-4">
          {links.map((link, index) => (
            <li key={index} className="text-center">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Error during Google API search:", error);
    return <p>Error during search</p>;
  }
}
