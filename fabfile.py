from fabric.api import *
from contextlib import contextmanager as _contextmanager
import os
from fabric.colors import green, red

PACKAGES_WWW = [
    "build-essential",
    "git",
    "vim",
    "python-dev",
    "python-virtualenv",
    "python-pip",
    "libgeos++",
    "libmysqlclient-dev",
    "libncurses5-dev",
]

nginx_config_path = os.path.realpath('deploy/nginx/')
nginx_avaliable_path = "/etc/nginx/sites-available/"
nginx_enable_path = "/etc/nginx/sites-enabled/"
config_path = os.path.realpath('deploy/supervisor/')
config_file = os.path.basename(config_path)
supervisor_etc_path = "/etc/supervisor/conf.d/"

#
# virtualenv functions
#
def create_virtualenv():
    """ setup virtualenv on remote host """
    args = '--clear --no-site-packages --distribute'
    run('virtualenv %s %s' % (args, env.virtualenv_root))

@_contextmanager
def virtualenv():
    "Activate virtualenv"
    with cd(env.directory):
        with prefix(env.activate):
            yield

#
# per machine options
#


def server() :
    """This pushes to the EC2 instance defined below"""
    # The Elastic IP to your server
    env.host_string = '107.170.138.156'
    # your user on that system
    env.user = 'root'
    env.virtualenv_root = '/www/mozio-package'
    env.directory = '/www/mozio-package/mozio/'
    env.activate = 'source /www/mozio-package/bin/activate'
    env.name = "mozio"

#
#   nginx functions
#


def nginx_reset():
    "Reset nginx"
    run("service nginx restart")


def nginx_start():
    "Start nginx"
    run("service nginx start")


def nginx_stop():
    "Stop nginx"
    run("service nginx stop")

def nginx_enable_site(nginx_config_file):
    "Enable nginx site"
    with cd(nginx_enable_path):
        run('ln -s ' + nginx_avaliable_path + nginx_config_file)

def nginx_disable_site(nginx_config_file):
    "Disable nginx site"
    run("rm " + nginx_enable_path + nginx_config_file)


def info():
    "Show host name"
    run('uname -a')


def setup():
    "Install default packages for django and configure machine"
    run("apt-get install -y " + " ".join(PACKAGES_WWW))

    run("supervisorctl stop %s " % env.name)

    # configure www directory
    run("mkdir -p /www/")
    run("mkdir -p %s" % env.directory)
    run("chown -R root:www-data /www/")
    run("chmod 775 -R /www/")
    run("chmod g+s -R /www/")

    # create virtual env
    package_name = "/www/%s-package" % str(env.name)
    run("virtualenv " + package_name)
    with cd(package_name):
        run("mkdir -p logs")

    # update server sourcecode
    with cd(env.virtualenv_root):
        sudo('rm -fr %(directory)s' % env)
        run('git clone https://github.com/wsantos/samplemap.git %(name)s' % env )

    # install requirements
    with cd(env.directory):
        with virtualenv():
            run("pip install -r requirements.txt")

    # send supervisor confs
    for file_name in os.listdir(config_path):
        put(os.path.join(config_path, file_name), supervisor_etc_path)

    # restart supervisor
    run("service supervisor restart")

    # send nginx confs
    for file_name in os.listdir(nginx_config_path):
        put(os.path.join(nginx_config_path, file_name), nginx_avaliable_path)

        # enable site
        with cd(nginx_enable_path):
            run('ln -sf ' + nginx_avaliable_path + file_name)

    # restart nginx
    run("service nginx restart")
