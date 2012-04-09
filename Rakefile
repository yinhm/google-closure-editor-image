require 'rake/clean'
require 'closure-compiler' # for compiler jar
COMPILER = Closure::COMPILER_JAR

CLOSURE_LIB_DIR   = "~/sources/closure"

PYTHON = "python"
DEPSWRITER = File.join(CLOSURE_LIB_DIR,  "closure/bin/build/depswriter.py")
BUILDER = File.join(CLOSURE_LIB_DIR,  "closure/bin/build/closurebuilder.py")

DEPS_FILE = "deps.js"
COMPILED_FILE = 'editor.min.js'

task :default => ["closure:deps"]

namespace "closure" do 
  task :deps do
    sh(["#{PYTHON} #{DEPSWRITER}",
             "--root_with_prefix=\". ../google-closure-editor-image\"",
             "--output_file=#{DEPS_FILE}"
            ].join(' '))
  end

  task :build do
    namespace = 'imigu.editor'

    sh(["#{PYTHON} #{BUILDER} -n #{namespace}",
        "-o compiled -c #{COMPILER}",
        "--root #{CLOSURE_LIB_DIR} --root .",
        "-f \"--compilation_level=ADVANCED_OPTIMIZATIONS\"",
        "-f \"--warning_level=VERBOSE\"",
        "> #{COMPILED_FILE}",
       ].join(' '))
  end
end

