import os
import sys

def rename_sprites(folder=., dry_run=True)
    for filename in os.listdir(folder)
        old_path = os.path.join(folder, filename)

        if not os.path.isfile(old_path)
            continue

        new_name = filename

        # Handle HD first
        if -sprite-hd in new_name
            new_name = new_name.replace(-sprite-hd, )
        # Then handle normal sprite
        elif -sprite in new_name
            new_name = new_name.replace(-sprite, -ld)

        if new_name != filename
            new_path = os.path.join(folder, new_name)

            if dry_run
                print(f[DRY RUN] {filename} - {new_name})
            else
                print(fRenaming {filename} - {new_name})
                os.rename(old_path, new_path)

if __name__ == __main__
    # Usage
    # python rename_sprites.py [folder] [--apply]

    folder = sys.argv[1] if len(sys.argv)  1 else .
    apply_changes = --apply in sys.argv

    rename_sprites(folder, dry_run=not apply_changes)
