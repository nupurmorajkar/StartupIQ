import os
import zipfile

def create_zip(source_dir, output_zip):
    print(f"Creating zip: {output_zip} from {source_dir}...")
    exclude_dirs = {"node_modules", "dist", ".git", ".system_generated", "scratch"}
    exclude_extensions = {".zip"}

    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in exclude_extensions:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                zipf.write(full_path, rel_path)

    size_kb = os.path.getsize(output_zip) / 1024
    print(f"[OK] Created {output_zip} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    workspace_root = os.path.dirname(base_dir)

    target_1 = os.path.join(base_dir, "Startup_IQ_Fullstack.zip")
    target_2 = os.path.join(workspace_root, "Startup_IQ_Fullstack.zip")

    create_zip(base_dir, target_1)
    create_zip(base_dir, target_2)
