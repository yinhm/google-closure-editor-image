require 'rake/clean'

CLOSURE_LIB_DIR   = "~/sources/closure"

PYTHON = "python"
DEPSWRITER = File.join(CLOSURE_LIB_DIR,  "closure/bin/build/depswriter.py")

DEPS_FILE = "deps.js"

task :default => ["closure:deps"]

namespace "closure" do 
  task :deps do
    sh(["#{PYTHON} #{DEPSWRITER}",
             "--root_with_prefix=\". ../google-closure-editor-image\"",
             "--output_file=#{DEPS_FILE}"
            ].join(' '))
  end
end

